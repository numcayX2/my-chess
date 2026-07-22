"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGameStore } from "@/store/gameStore";
import SetupModal from "@/components/SetupModal";
import Board from "@/components/Board";
import EvalBar from "@/components/EvalBar";
import AdvicePanel from "@/components/AdvicePanel";
import MoveList from "@/components/MoveList";
import GameSummary from "@/components/GameSummary";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const phase = useGameStore((s) => s.phase);
  const elo = useGameStore((s) => s.elo);
  const playerColor = useGameStore((s) => s.playerColor);
  const resetToSetup = useGameStore((s) => s.resetToSetup);
  
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Phase transition animation
  useGSAP(() => {
    if (phase === "playing" && mainRef.current) {
      const ctx = gsap.context(() => {
        // Header snap-in
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -12, skewX: -2 },
          { opacity: 1, y: 0, skewX: 0, duration: 0.25, ease: "power2.out", delay: 0.05 }
        );
        
        // Grid elements stagger
        const gridChildren = gridRef.current?.children;
        if (gridChildren) {
          gsap.fromTo(
            gridChildren,
            { opacity: 0, y: 16, scale: 0.98 },
            { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              duration: 0.2, 
              ease: "power2.out", 
              stagger: 0.08,
              delay: 0.15 
            }
          );
        }
      }, mainRef);
      
      return () => ctx.revert();
    }
  }, [phase]);

  if (phase === "setup") return <SetupModal />;
  if (phase === "finished") return <GameSummary />;

  return (
    <main 
      ref={mainRef}
      className="flex-1 flex flex-col px-4 sm:px-8 py-6 sm:py-10 overflow-auto"
    >
      {/* ── Tactical Header ────────────────────────────── */}
      <header 
        ref={headerRef}
        className="w-full max-w-[1200px] mx-auto mb-8 flex items-end justify-between gap-4 opacity-0"
      >
        <div className="flex flex-col gap-2">
          {/* Status Line */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-[var(--accent-hazard)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 bg-[var(--accent-hazard)]" />
            </span>
            <span className="pixel-text text-[10px] tracking-[0.25em] text-[var(--accent-hazard)]">
              LIVE // TACTICAL // ONLINE
            </span>
          </div>
          
          {/* Title Block */}
          <div className="flex items-baseline gap-4">
            <h1 className="font-display text-xl sm:text-2xl font-black italic uppercase tracking-tight text-[var(--foreground)]">
              คุณเล่นฝ่าย
              <span
                className={
                  playerColor === "w"
                    ? "text-[var(--foreground)]"
                    : "text-[var(--foreground-dim)]"
                }
              >
                {playerColor === "w" ? "ขาว" : "ดำ"}
              </span>
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 border border-[var(--border-heavy)] bg-[var(--bg-panel)]">
              <span className="pixel-text text-[10px] text-[var(--foreground-dim)]">ELO</span>
              <span className="notation text-sm font-bold text-[var(--accent-hazard)]">{elo}</span>
            </div>
          </div>
        </div>

        {/* Abort Button */}
        <button
          onClick={resetToSetup}
          className="tactical-btn notation text-[11px] tracking-wide px-4 py-2 hover:border-[var(--accent-crimson)] hover:text-[var(--accent-crimson)] active:scale-[0.97]"
        >
          [ ยกเลิกเกม ]
        </button>
      </header>

      {/* ── Tactical Grid ──────────────────────────────── */}
      <div 
        ref={gridRef}
        className="w-full max-w-[1200px] mx-auto flex-1 grid grid-cols-1 lg:grid-cols-[52px_1fr_340px] gap-5 lg:gap-6 items-start"
      >
        {/* Eval bar — tactical gauge */}
        <div className="hidden lg:flex justify-center pt-0">
          <EvalBar />
        </div>

        {/* Chess board with bracket frame */}
        <div className="flex justify-center lg:justify-start">
          <div className="bracket-frame">
            <Board />
          </div>
        </div>

        {/* Side panel: Advice + Move list */}
        <aside className="w-full lg:w-auto flex flex-col gap-4 lg:gap-5 h-auto lg:h-[600px]">
          {/* Advice panel */}
          <div className="flex-1 min-h-[200px] lg:min-h-0 tactical-panel overflow-hidden">
            <AdvicePanel />
          </div>

          {/* Move list */}
          <div className="h-[240px] lg:h-[280px] tactical-panel overflow-hidden">
            <MoveList />
          </div>
        </aside>
      </div>
    </main>
  );
}