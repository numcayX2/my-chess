"use client";

import { useRef, useCallback } from "react";
import { Chessboard, PieceDropHandlerArgs } from "react-chessboard";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGameStore } from "@/store/gameStore";
import { useGameEngine } from "@/hooks/useGameEngine";

gsap.registerPlugin(useGSAP);

export default function Board() {
  const fen = useGameStore((s) => s.fen);
  const playerColor = useGameStore((s) => s.playerColor);
  const { onDrop } = useGameEngine();

  const boardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Board entry animation with GSAP
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

  // ปรับ Type ของ targetSquare ให้รองรับ string | null ตามที่ react-chessboard กำหนด
  const handleDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!targetSquare) return false;

      const result = onDrop({ sourceSquare, targetSquare });

      if (result && frameRef.current) {
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
      }

      return result;
    },
    [onDrop],
  );

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
        {/* Corner Brackets */}
        <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--accent-hazard)] z-10 pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--accent-hazard)] z-10 pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--accent-hazard)] z-10 pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--accent-hazard)] z-10 pointer-events-none" />

        {/* Hazard Stripe Top Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] hazard-stripes opacity-70 z-10 pointer-events-none" />

        {/* CRT Scanline Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20 opacity-25"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
          }}
        />

        {/* Chessboard Component Container */}
        <div ref={boardRef} className="w-full h-full">
          <Chessboard
            options={{
              position: fen,
              onPieceDrop: handleDrop,
              boardOrientation: playerColor === "w" ? "white" : "black",
              darkSquareStyle: { backgroundColor: "var(--color-board-dark)" },
              lightSquareStyle: { backgroundColor: "var(--color-board-light)" },
              showNotation: true,
              animationDurationInMs: 200,
            }}
          />
        </div>
      </div>

      {/* Bottom Tactical Info Bar */}
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
