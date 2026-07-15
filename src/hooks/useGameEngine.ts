"use client";

import { useEffect, useRef } from "react";
import type { Square } from "chess.js";
import { useGameStore, type PlayerColor } from "@/store/gameStore";
import { getStockfish } from "@/lib/stockfishClient";
import { classifyMove } from "@/lib/moveClassifier";
import { uciToSan } from "@/lib/chessUtils";
import { fetchMoveAdvice } from "@/lib/ollama";

type PrevAnalysis = {
  fen: string;
  evalCp: number | null;
  mate: number | null;
  bestMoveUci: string | null;
};

export function useGameEngine() {
  const phase = useGameStore((s) => s.phase);
  const fen = useGameStore((s) => s.fen);
  const elo = useGameStore((s) => s.elo);

  const processedFenRef = useRef<string | null>(null);
  const prevAnalysisRef = useRef<PrevAnalysis>({
    fen: fen,
    evalCp: 20,
    mate: null,
    bestMoveUci: null,
  });

  // Warm up the engine as soon as we enter the game.
  useEffect(() => {
    if (phase === "playing") {
      getStockfish().waitUntilReady();
    }
  }, [phase]);

  // Reset tracking whenever a new game starts.
  useEffect(() => {
    if (phase === "playing") {
      processedFenRef.current = null;
      prevAnalysisRef.current = { fen, evalCp: 20, mate: null, bestMoveUci: null };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === "playing"]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (processedFenRef.current === fen) return;
    processedFenRef.current = fen;

    let cancelled = false;

    (async () => {
      const store = useGameStore.getState();
      const engine = getStockfish();
      const game = store.game;
      const verboseHistory = game.history({ verbose: true });
      const lastMove = verboseHistory[verboseHistory.length - 1];

      store.setAnalysis({ thinking: true });
      const info = await engine.analyze(fen, 14, (partial) => {
        if (!cancelled) store.setAnalysis(partial);
      });
      if (cancelled) return;

      const bestMoveSanNow = uciToSan(info.bestMoveUci, fen);
      store.setAnalysis({ ...info, bestMoveSan: bestMoveSanNow, thinking: false });

      if (lastMove) {
        const moverColor: PlayerColor = lastMove.color as PlayerColor;
        const prev = prevAnalysisRef.current;
        const moveUci = `${lastMove.from}${lastMove.to}${lastMove.promotion ?? ""}`;
        const wasBest = !!prev.bestMoveUci && prev.bestMoveUci.startsWith(moveUci.slice(0, 4));

        const classification = classifyMove(
          moverColor,
          prev.evalCp,
          prev.mate,
          info.evalCp,
          info.mate,
          wasBest
        );

        store.pushEvalPoint({
          moveNumber: Math.ceil(verboseHistory.length / 2),
          san: lastMove.san,
          fen,
          fenBefore: prev.fen,
          byColor: moverColor,
          evalBefore: prev.evalCp,
          evalAfter: info.evalCp,
          mateBefore: prev.mate,
          mateAfter: info.mate,
          bestMoveBefore: prev.bestMoveUci,
          classification,
        });

        // Only bother the LLM with the player's own moves.
        if (moverColor === store.playerColor) {
          const bestMoveSanBefore = uciToSan(prev.bestMoveUci, prev.fen);
          store.setAdvice({ loading: true });
          try {
            const text = await fetchMoveAdvice({
              fen,
              lastMoveSan: lastMove.san,
              moverColor,
              evalCp: info.evalCp,
              mate: info.mate,
              bestMoveSan: bestMoveSanBefore,
              classification,
            });
            if (!cancelled) store.setAdvice({ text, loading: false });
          } catch (err) {
            if (!cancelled) {
              store.setAdvice({
                text:
                  err instanceof Error
                    ? err.message
                    : "เรียก Ollama ไม่สำเร็จ ตรวจสอบว่า Ollama กำลังรันอยู่",
                loading: false,
              });
            }
          }
        }
      }

      prevAnalysisRef.current = {
        fen,
        evalCp: info.evalCp,
        mate: info.mate,
        bestMoveUci: info.bestMoveUci,
      };

      // If it's now the opponent's turn, let Stockfish (strength-limited) reply.
      if (!game.isGameOver() && game.turn() !== store.playerColor) {
        const uci = await engine.getEngineMove(fen, elo, 700);
        if (!cancelled) {
          useGameStore.getState().applyEngineMove(uci);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, phase]);

  function onDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean {
    if (!targetSquare) return false;
    const store = useGameStore.getState();
    if (store.game.turn() !== store.playerColor) return false;
    return store.makeMove(sourceSquare as Square, targetSquare as Square, "q");
  }

  return { onDrop };
}
