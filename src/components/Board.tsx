"use client";

import { useRef, useCallback, useMemo, useState } from "react";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";
import type { Square } from "chess.js";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGameStore } from "@/store/gameStore";
import { useGameEngine } from "@/hooks/useGameEngine";

gsap.registerPlugin(useGSAP);

export default function Board() {
  const fen = useGameStore((s) => s.fen);
  const playerColor = useGameStore((s) => s.playerColor);
  const game = useGameStore((s) => s.game);
  const { onDrop } = useGameEngine();

  const boardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // ตาราง state สำหรับ click-to-move: ช่องที่เลือกอยู่ + ช่องปลายทางที่เดินได้
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        frameRef.current,
        { opacity: 0, scale: 0.97, rotateX: 2 },
        {
          opacity: 1,
          scale: 1,
          rotateX: 0,
          duration: 0.25,
          ease: "power2.out",
          delay: 0.1,
        },
      );
    },
    { scope: frameRef },
  );

  const flashBoard = useCallback(() => {
    if (!frameRef.current) return;
    gsap.fromTo(
      frameRef.current,
      { boxShadow: "0 0 0px rgba(255, 214, 0, 0)" },
      {
        boxShadow: "0 0 25px rgba(255, 214, 0, 0.5)",
        duration: 0.15,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
      },
    );
  }, []);

  const handleDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!targetSquare) return false;
      const result = onDrop({ sourceSquare, targetSquare });
      if (result) flashBoard();
      setSelectedSquare(null);
      return result;
    },
    [onDrop, flashBoard],
  );

  // คลิกเลือกหมาก / คลิกช่องปลายทางเพื่อเดิน (แทน/เสริมการลาก)
  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      const isMyTurn = game.turn() === playerColor;
      if (!isMyTurn) return;

      if (selectedSquare) {
        if (square === selectedSquare) {
          setSelectedSquare(null);
          return;
        }
        const result = onDrop({
          sourceSquare: selectedSquare,
          targetSquare: square,
        });
        if (result) {
          flashBoard();
          setSelectedSquare(null);
          return;
        }
      }

      const piece = game.get(square as Square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square as Square);
      } else {
        setSelectedSquare(null);
      }
    },
    [game, playerColor, selectedSquare, onDrop, flashBoard],
  );

  // ช่องที่เดินได้จากช่องที่เลือกอยู่ (สำหรับวาดจุด)
  const legalTargets = useMemo(() => {
    if (!selectedSquare) return [];
    return game
      .moves({ square: selectedSquare, verbose: true })
      .map((m) => m.to);
  }, [game, selectedSquare, fen]);

  // ช่องของกษัตริย์ที่กำลังโดนรุกอยู่ (ถ้ามี)
  const checkSquare = useMemo(() => {
    if (!game.inCheck()) return null;
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = board[r][c];
        if (cell && cell.type === "k" && cell.color === game.turn())
          return cell.square;
      }
    }
    return null;
  }, [game, fen]);

  // ช่องต้นทาง/ปลายทางของตาล่าสุด
  const lastMoveSquares = useMemo(() => {
    const history = game.history({ verbose: true });
    const last = history[history.length - 1];
    return last ? [last.from, last.to] : [];
  }, [game, fen]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    for (const sq of lastMoveSquares) {
      styles[sq] = {
        backgroundColor:
          "color-mix(in srgb, var(--accent-hazard) 22%, transparent)",
      };
    }

    if (checkSquare) {
      styles[checkSquare] = {
        backgroundColor:
          "color-mix(in srgb, var(--accent-crimson) 55%, transparent)",
        boxShadow: "inset 0 0 0 2px var(--accent-crimson)",
      };
    }

    if (selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        backgroundColor:
          "color-mix(in srgb, var(--accent-hazard) 40%, transparent)",
      };
    }

    for (const sq of legalTargets) {
      const isCapture = !!game.get(sq as Square);
      styles[sq] = {
        ...styles[sq],
        backgroundImage: isCapture
          ? "radial-gradient(circle, transparent 58%, color-mix(in srgb, var(--accent-lime) 65%, transparent) 60%, transparent 72%)"
          : "radial-gradient(circle, color-mix(in srgb, var(--accent-lime) 55%, transparent) 22%, transparent 24%)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    return styles;
  }, [lastMoveSquares, checkSquare, selectedSquare, legalTargets, game]);

  return (
    <div className="flex flex-col items-center w-full">
      <div
        ref={frameRef}
        className="relative w-full max-w-[560px] aspect-square opacity-0 bg-[var(--bg-panel)]"
        style={{
          border: "3px solid var(--border-heavy)",
          boxShadow: "0 0 0 1px var(--bg-base), 0 0 20px rgba(0,0,0,0.6)",
        }}
      >
        <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--accent-hazard)] z-10 pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--accent-hazard)] z-10 pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--accent-hazard)] z-10 pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--accent-hazard)] z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] hazard-stripes opacity-70 z-10 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none z-20 opacity-25"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
          }}
        />

        <div ref={boardRef} className="w-full h-full">
          <Chessboard
            options={{
              position: fen,
              onPieceDrop: handleDrop,
              onSquareClick: handleSquareClick,
              squareStyles,
              boardOrientation: playerColor === "w" ? "white" : "black",
              darkSquareStyle: { backgroundColor: "var(--color-board-dark)" },
              lightSquareStyle: { backgroundColor: "var(--color-board-light)" },
              showNotation: true,
              animationDurationInMs: 200,
            }}
          />
        </div>
      </div>

      <div className="w-full max-w-[560px] flex items-center justify-between mt-2 px-1">
        <span className="pixel-text text-[9px] text-[var(--foreground-dim)] tracking-wider">
          FEN: {fen.split(" ")[0].substring(0, 24)}...
        </span>
        <span className="notation text-[9px] font-bold text-[var(--accent-orange)] uppercase">
          {playerColor === "w"
            ? "ORIENTATION // WHITE"
            : "ORIENTATION // BLACK"}
        </span>
      </div>
    </div>
  );
}
