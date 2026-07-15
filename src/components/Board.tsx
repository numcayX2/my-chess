"use client";

import { Chessboard } from "react-chessboard";
import { useGameStore } from "@/store/gameStore";
import { useGameEngine } from "@/hooks/useGameEngine";

export default function Board() {
  const fen = useGameStore((s) => s.fen);
  const playerColor = useGameStore((s) => s.playerColor);
  const { onDrop } = useGameEngine();

  return (
    <div className="w-full max-w-[560px] aspect-square rounded-md overflow-hidden border border-[var(--border-subtle)]">
      <Chessboard
        options={{
          position: fen,
          onPieceDrop: onDrop,
          boardOrientation: playerColor === "w" ? "white" : "black",
          darkSquareStyle: { backgroundColor: "var(--color-board-dark)" },
          lightSquareStyle: { backgroundColor: "var(--color-board-light)" },
          showNotation: true,
          animationDurationInMs: 200,
        }}
      />
    </div>
  );
}
