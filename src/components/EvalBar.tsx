"use client";

import { useGameStore } from "@/store/gameStore";

function evalToWhitePercent(cp: number | null, mate: number | null): number {
  if (mate !== null) return mate > 0 ? 99 : 1;
  if (cp === null) return 50;
  // Squash centipawns into a 0-100 range with a soft curve (400cp ~= 90%).
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
  const whiteWinning = (analysis.mate !== null ? analysis.mate > 0 : (analysis.evalCp ?? 0) >= 0);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-8 h-[420px] rounded-md overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <div
          className="absolute bottom-0 left-0 right-0 bg-[var(--color-board-light)] transition-all duration-500 ease-out"
          style={{ height: `${whitePct}%` }}
        />
        {analysis.thinking && (
          <div className="absolute inset-0 animate-pulse bg-[var(--accent-brass)]/10" />
        )}
      </div>
      <p
        className={`notation text-sm font-semibold ${
          whiteWinning ? "text-[var(--foreground)]" : "text-[var(--foreground-dim)]"
        }`}
      >
        {label}
      </p>
      <p className="text-[10px] text-[var(--foreground-dim)] uppercase tracking-wider">
        {analysis.thinking ? `กำลังคิด d${analysis.depth || 0}` : `ลึก ${analysis.depth}`}
      </p>
    </div>
  );
}
