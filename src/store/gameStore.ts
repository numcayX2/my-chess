import { create } from "zustand";
import { Chess, type Square } from "chess.js";

export type PlayerColor = "w" | "b";
export type ColorChoice = "white" | "random" | "black";

export type EvalPoint = {
  moveNumber: number;
  san: string;
  fen: string; // position AFTER this move
  fenBefore: string; // position BEFORE this move (for computing best-move SAN)
  byColor: PlayerColor;
  evalBefore: number | null; // centipawns, from white's perspective
  evalAfter: number | null;
  mateBefore: number | null;
  mateAfter: number | null;
  bestMoveBefore: string | null; // UCI of engine's suggested move, from the position before this move
  classification: MoveClass | null;
};

export type MoveClass =
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "book";

export type GamePhase = "setup" | "playing" | "finished";

export type AnalysisState = {
  evalCp: number | null;
  mate: number | null;
  bestMoveUci: string | null;
  bestMoveSan: string | null;
  pv: string[];
  depth: number;
  thinking: boolean;
};

export type AdviceState = {
  text: string;
  loading: boolean;
};

type GameStore = {
  phase: GamePhase;
  playerColor: PlayerColor;
  colorChoice: ColorChoice;
  elo: number; // opponent (Stockfish) strength
  game: Chess;
  fen: string;
  history: EvalPoint[];
  analysis: AnalysisState;
  advice: AdviceState;
  summary: { text: string; loading: boolean } | null;
  gameOverReason: string | null;

  startGame: (choice: ColorChoice, elo: number) => void;
  resetToSetup: () => void;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  applyEngineMove: (uciMove: string) => void;
  setAnalysis: (partial: Partial<AnalysisState>) => void;
  pushEvalPoint: (point: EvalPoint) => void;
  setAdvice: (partial: Partial<AdviceState>) => void;
  setSummary: (partial: { text: string; loading: boolean } | null) => void;
  checkGameOver: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "setup",
  playerColor: "w",
  colorChoice: "white",
  elo: 1200,
  game: new Chess(),
  fen: new Chess().fen(),
  history: [],
  analysis: {
    evalCp: 0,
    mate: null,
    bestMoveUci: null,
    bestMoveSan: null,
    pv: [],
    depth: 0,
    thinking: false,
  },
  advice: { text: "", loading: false },
  summary: null,
  gameOverReason: null,

  startGame: (choice, elo) => {
    const resolved: PlayerColor =
      choice === "white" ? "w" : choice === "black" ? "b" : Math.random() < 0.5 ? "w" : "b";
    const game = new Chess();
    set({
      phase: "playing",
      playerColor: resolved,
      colorChoice: choice,
      elo,
      game,
      fen: game.fen(),
      history: [],
      advice: { text: "", loading: false },
      summary: null,
      gameOverReason: null,
      analysis: {
        evalCp: 0,
        mate: null,
        bestMoveUci: null,
        bestMoveSan: null,
        pv: [],
        depth: 0,
        thinking: false,
      },
    });
  },

  resetToSetup: () => set({ phase: "setup" }),

  makeMove: (from, to, promotion = "q") => {
    const { game } = get();
    try {
      const move = game.move({ from, to, promotion });
      if (!move) return false;
      set({ fen: game.fen() });
      get().checkGameOver();
      return true;
    } catch {
      return false;
    }
  },

  applyEngineMove: (uciMove) => {
    const { game } = get();
    const from = uciMove.slice(0, 2) as Square;
    const to = uciMove.slice(2, 4) as Square;
    const promotion = uciMove.length > 4 ? uciMove.slice(4) : undefined;
    try {
      game.move({ from, to, promotion });
      set({ fen: game.fen() });
      get().checkGameOver();
    } catch {
      // ignore illegal engine move (shouldn't happen)
    }
  },

  setAnalysis: (partial) => set((s) => ({ analysis: { ...s.analysis, ...partial } })),

  pushEvalPoint: (point) => set((s) => ({ history: [...s.history, point] })),

  setAdvice: (partial) => set((s) => ({ advice: { ...s.advice, ...partial } })),

  setSummary: (val) => set({ summary: val }),

  checkGameOver: () => {
    const { game } = get();
    if (game.isGameOver()) {
      let reason = "จบเกม";
      if (game.isCheckmate()) reason = "รุกฆาต";
      else if (game.isStalemate()) reason = "หมดสิทธิ์เดิน (Stalemate)";
      else if (game.isThreefoldRepetition()) reason = "เดินซ้ำ 3 ครั้ง";
      else if (game.isInsufficientMaterial()) reason = "หมากไม่พอรุกฆาต";
      else if (game.isDraw()) reason = "เสมอ";
      set({ phase: "finished", gameOverReason: reason });
    }
  },
}));
