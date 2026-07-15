"use client";

import { useGameStore } from "@/store/gameStore";
import SetupModal from "@/components/SetupModal";
import Board from "@/components/Board";
import EvalBar from "@/components/EvalBar";
import AdvicePanel from "@/components/AdvicePanel";
import MoveList from "@/components/MoveList";
import GameSummary from "@/components/GameSummary";

export default function Home() {
  const phase = useGameStore((s) => s.phase);
  const elo = useGameStore((s) => s.elo);
  const playerColor = useGameStore((s) => s.playerColor);
  const resetToSetup = useGameStore((s) => s.resetToSetup);

  if (phase === "setup") return <SetupModal />;
  if (phase === "finished") return <GameSummary />;

  return (
    <main className="flex-1 px-6 py-8">
      <header className="flex items-center justify-between max-w-6xl mx-auto mb-8">
        <div>
          <p className="notation text-xs tracking-[0.3em] text-[var(--accent-brass)] mb-1">
            LIVE GAME
          </p>
          <h1 className="font-display text-2xl italic">
            คุณเล่นฝ่าย{playerColor === "w" ? "ขาว" : "ดำ"} · คู่แข่ง ELO {elo}
          </h1>
        </div>
        <button
          onClick={resetToSetup}
          className="notation text-xs px-4 py-2 rounded-full border border-[var(--border-subtle)] text-[var(--foreground-dim)] hover:border-[var(--accent-brass-dim)] cursor-pointer"
        >
          ยกเลิกเกม
        </button>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr_320px] gap-8 items-start">
        <div className="hidden lg:flex justify-center">
          <EvalBar />
        </div>

        <div className="flex justify-center">
          <Board />
        </div>

        <div className="grid grid-rows-[1fr_260px] gap-6 h-[560px]">
          <AdvicePanel />
          <MoveList />
        </div>
      </div>
    </main>
  );
}
