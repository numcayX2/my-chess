"use client";

import { useGameStore } from "@/store/gameStore";
import { CLASS_LABEL_TH, CLASS_COLOR } from "@/lib/moveClassifier";

export default function AdvicePanel() {
  const advice = useGameStore((s) => s.advice);
  const history = useGameStore((s) => s.history);
  const playerColor = useGameStore((s) => s.playerColor);

  const lastPlayerPoint = [...history].reverse().find((p) => p.byColor === playerColor);

  return (
    <div className="felt-panel rounded-md p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl italic">คำแนะนำจากโค้ช</h2>
        {lastPlayerPoint?.classification && (
          <span
            className={`notation text-xs px-2.5 py-1 rounded-full border border-[var(--border-subtle)] ${
              CLASS_COLOR[lastPlayerPoint.classification]
            }`}
          >
            {CLASS_LABEL_TH[lastPlayerPoint.classification]}
          </span>
        )}
      </div>

      {lastPlayerPoint && (
        <p className="notation text-xs text-[var(--foreground-dim)]">
          ตาที่ {lastPlayerPoint.moveNumber} · {lastPlayerPoint.san}
        </p>
      )}

      <div className="flex-1 min-h-[140px]">
        {advice.loading ? (
          <div className="flex items-center gap-2 text-[var(--foreground-dim)] text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-brass)] animate-pulse" />
            กำลังให้ Ollama วิเคราะห์การเดิน...
          </div>
        ) : advice.text ? (
          <p className="text-sm leading-relaxed whitespace-pre-line animate-rise-in">
            {advice.text}
          </p>
        ) : (
          <p className="text-sm text-[var(--foreground-dim)] leading-relaxed">
            เดินหมากตาแรกของคุณ แล้วโค้ช AI จะอธิบายให้ทันที
          </p>
        )}
      </div>
    </div>
  );
}
