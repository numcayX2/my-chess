"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGameStore } from "@/store/gameStore";
import { CLASS_LABEL_TH, CLASS_COLOR } from "@/lib/moveClassifier";

gsap.registerPlugin(useGSAP);

export default function AdvicePanel() {
  const advice = useGameStore((s) => s.advice);
  const history = useGameStore((s) => s.history);
  const playerColor = useGameStore((s) => s.playerColor);

  const lastPlayerPoint = [...history].reverse().find((p) => p.byColor === playerColor);

  const panelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevTextRef = useRef("");

  // Text scramble/reveal animation when advice changes
  useEffect(() => {
    if (advice.text && textRef.current && advice.text !== prevTextRef.current) {
      prevTextRef.current = advice.text;
      
      const element = textRef.current;
      const finalText = advice.text;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let iteration = 0;
      const totalIterations = 12;
      
      gsap.fromTo(
        element,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" }
      );
      
      // Simple scramble effect
      const interval = setInterval(() => {
        element.textContent = finalText
          .split("")
          .map((char, index) => {
            if (index < iteration) return finalText[index];
            if (char === " " || char === "\n") return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
        
        iteration += finalText.length / totalIterations;
        
        if (iteration >= finalText.length) {
          element.textContent = finalText;
          clearInterval(interval);
        }
      }, 25);
      
      return () => clearInterval(interval);
    }
  }, [advice.text]);

  // Badge pop animation
  useEffect(() => {
    if (badgeRef.current && lastPlayerPoint?.classification) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" }
      );
    }
  }, [lastPlayerPoint?.classification]);

  return (
    <div ref={panelRef} className="h-full flex flex-col p-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-heavy)]">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-[var(--accent-cyan)]" />
          <h2 className="font-display text-lg font-black italic uppercase tracking-tight text-[var(--foreground)]">
            คำแนะนำ
          </h2>
        </div>
        
        {lastPlayerPoint?.classification && (
          <span
            ref={badgeRef}
            className={`notation text-[10px] uppercase tracking-wider px-2.5 py-0.5 border-2 transition-colors duration-150 ${
              CLASS_COLOR[lastPlayerPoint.classification]
            }`}
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
            }}
          >
            {CLASS_LABEL_TH[lastPlayerPoint.classification]}
          </span>
        )}
      </div>

      {/* Move Context */}
      {lastPlayerPoint && (
        <div className="flex items-center gap-3 mb-3">
          <span className="pixel-text text-[10px] text-[var(--accent-orange)]">
            MOVE {lastPlayerPoint.moveNumber}
          </span>
          <span className="notation text-xs text-[var(--foreground-dim)]">
            {lastPlayerPoint.san}
          </span>
        </div>
      )}

      {/* Advice Content */}
      <div className="flex-1 min-h-[140px] relative crt-overlay">
        {advice.loading ? (
          <div className="flex items-center gap-3 text-[var(--foreground-dim)] text-sm">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[var(--accent-cyan)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-[var(--accent-cyan)] animate-bounce" style={{ animationDelay: "100ms" }} />
              <span className="w-1.5 h-1.5 bg-[var(--accent-cyan)] animate-bounce" style={{ animationDelay: "200ms" }} />
            </div>
            <span className="pixel-text text-[10px] tracking-wider animate-pulse">
              ANALYZING_POSITION...
            </span>
          </div>
        ) : advice.text ? (
          <p 
            ref={textRef}
            className="text-sm leading-relaxed whitespace-pre-line text-[var(--foreground)]"
          >
            {advice.text}
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <span className="pixel-text text-2xl text-[var(--accent-hazard)]">&gt;_</span>
            <p className="text-sm text-[var(--foreground-dim)]">
              เดินหมากตาแรกของคุณ แล้วโค้ช AI จะอธิบายให้ทันที
            </p>
          </div>
        )}
      </div>

      {/* Footer status bar */}
      <div className="mt-3 pt-2 border-t border-[var(--border-heavy)] flex items-center justify-between">
        <span className="pixel-text text-[9px] text-[var(--foreground-muted)] tracking-wider">
          AI_COACH_ENGINE
        </span>
        <span className={`pixel-text text-[9px] tracking-wider ${advice.loading ? "text-[var(--accent-cyan)] animate-pulse" : "text-[var(--accent-lime)]"}`}>
          {advice.loading ? "PROCESSING" : "ONLINE"}
        </span>
      </div>
    </div>
  );
}