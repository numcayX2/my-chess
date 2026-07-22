"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGameStore } from "@/store/gameStore";

gsap.registerPlugin(useGSAP);

function evalToWhitePercent(cp: number | null, mate: number | null): number {
  if (mate !== null) return mate > 0 ? 99 : 1;
  if (cp === null) return 50;
  const clamped = Math.max(-1000, Math.min(1000, cp));
  const pct = 50 + 50 * Math.tanh(clamped / 350);
  return Math.max(1, Math.min(99, pct));
}

function formatEval(cp: number | null, mate: number | null): string {
  if (mate !== null) return `M${Math.abs(mate)}`;
  if (cp === null) return "0.0";
  const pawns = cp / 100;
  return `${pawns >= 0 ? "+" : ""}${pawns.toFixed(1)}`;
}

export default function EvalBar() {
  const analysis = useGameStore((s) => s.analysis);
  const whitePct = evalToWhitePercent(analysis.evalCp, analysis.mate);
  const label = formatEval(analysis.evalCp, analysis.mate);
  const mate = analysis.mate;
  const hasMate = mate !== null;
  const whiteWinning = hasMate ? mate > 0 : (analysis.evalCp ?? 0) >= 0;

  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const prevPctRef = useRef(50);

  // Animate bar fill changes
  useEffect(() => {
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        height: `${whitePct}%`,
        duration: 0.4,
        ease: "power2.out",
      });
      
      // Color shift based on advantage
      const isExtreme = whitePct > 80 || whitePct < 20;
      if (isExtreme) {
        gsap.to(fillRef.current, {
          backgroundColor: whitePct > 50 ? "var(--accent-hazard)" : "var(--accent-crimson)",
          duration: 0.3,
        });
      } else {
        gsap.to(fillRef.current, {
          backgroundColor: "var(--foreground)",
          duration: 0.3,
        });
      }
    }
    
    prevPctRef.current = whitePct;
  }, [whitePct]);

  // Label pop animation on change
  useEffect(() => {
    if (labelRef.current) {
      gsap.fromTo(
        labelRef.current,
        { scale: 1.2, color: "var(--accent-hazard)" },
        { scale: 1, color: whiteWinning ? "var(--accent-hazard)" : "var(--foreground)", duration: 0.2, ease: "power2.out" }
      );
    }
  }, [label, whiteWinning]);

  // Thinking pulse
  useGSAP(() => {
    if (analysis.thinking && barRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(barRef.current, {
          boxShadow: "0 0 20px rgba(255, 214, 0, 0.3)",
          duration: 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }, barRef);
      return () => ctx.revert();
    } else if (barRef.current) {
      gsap.to(barRef.current, { boxShadow: "none", duration: 0.2 });
    }
  }, [analysis.thinking]);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Tactical Gauge Container */}
      <div 
        ref={barRef}
        className="relative w-12 h-[520px] border-2 border-[var(--border-heavy)] bg-[var(--bg-panel)] overflow-hidden"
      >
        {/* Hazard stripe top cap */}
        <div className="absolute top-0 left-0 right-0 h-[3px] hazard-stripes z-20" />
        
        {/* Background grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 z-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-px bg-[var(--foreground)] w-full" />
          ))}
        </div>

        {/* Fill */}
        <div
          ref={fillRef}
          className="absolute bottom-0 left-0 right-0 transition-colors"
          style={{
            height: `${prevPctRef.current}%`,
            backgroundColor: "var(--foreground)",
          }}
        >
          {/* Glow line at fill top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--accent-hazard)] shadow-[0_0_8px_rgba(255,214,0,0.6)]" />
        </div>

        {/* 50% Marker */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[var(--accent-orange)] z-10 shadow-[0_0_4px_rgba(255,107,0,0.5)]" />

        {/* Segmented markers */}
        <div className="absolute inset-y-0 right-0 w-1 flex flex-col justify-between py-1 z-10">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className={`h-[2px] w-full ${i < (whitePct / 10) ? "bg-[var(--accent-hazard)]" : "bg-[var(--border-heavy)]"}`}
            />
          ))}
        </div>

        {/* Thinking shine effect */}
        {analysis.thinking && (
          <div
            className="absolute -left-full top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_1.5s_linear_infinite] z-30"
          />
        )}
      </div>

      {/* Evaluation Display */}
      <div className="flex flex-col items-center gap-2 w-16">
        <div className="flex items-center gap-1.5">
          {hasMate && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-[var(--accent-crimson)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-[var(--accent-crimson)]" />
            </span>
          )}

          <div 
            ref={labelRef}
            className={`notation text-xl font-bold tracking-tight ${
              whiteWinning ? "text-[var(--accent-hazard)]" : "text-[var(--foreground-dim)]"
            }`}
          >
            {label}
          </div>
        </div>

        {analysis.thinking ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[var(--accent-hazard)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-[var(--accent-hazard)] animate-bounce" style={{ animationDelay: "100ms" }} />
              <span className="w-1.5 h-1.5 bg-[var(--accent-hazard)] animate-bounce" style={{ animationDelay: "200ms" }} />
            </div>
            <span className="pixel-text text-[9px] text-[var(--accent-orange)] tracking-wider">
              DPTH {analysis.depth}
            </span>
          </div>
        ) : (
          <span className="pixel-text text-[9px] text-[var(--foreground-dim)] tracking-wider">
            DPTH {analysis.depth}
          </span>
        )}
      </div>
    </div>
  );
}