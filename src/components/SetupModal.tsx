"use client";

import { useState } from "react";
import { useGameStore, type ColorChoice } from "@/store/gameStore";

const COLOR_OPTIONS: { value: ColorChoice; label: string; sub: string }[] = [
  { value: "white", label: "ฝ่ายขาว", sub: "เดินก่อนทุกเกม" },
  { value: "random", label: "สุ่ม", sub: "ให้เกมสุ่มสีให้" },
  { value: "black", label: "ฝ่ายดำ", sub: "AI เดินตาแรก" },
];

const ELO_PRESETS = [800, 1000, 1200, 1400, 1600, 1800, 2000, 2300, 2600];

export default function SetupModal() {
  const startGame = useGameStore((s) => s.startGame);
  const [choice, setChoice] = useState<ColorChoice>("white");
  const [elo, setElo] = useState(1200);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl felt-panel rounded-md p-10 animate-rise-in">
        <p className="notation text-xs tracking-[0.3em] text-[var(--accent-brass)] mb-2">
          NEW GAME
        </p>
        <h1 className="font-display text-4xl italic mb-8">
          ตั้งค่าเกมของคุณ
        </h1>

        <div className="mb-8">
          <p className="text-sm text-[var(--foreground-dim)] mb-3">เลือกสีที่จะเล่น</p>
          <div className="grid grid-cols-3 gap-3">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setChoice(opt.value)}
                className={`rounded-md border px-3 py-4 text-left transition-colors cursor-pointer ${
                  choice === opt.value
                    ? "border-[var(--accent-brass)] bg-[var(--bg-panel-raised)]"
                    : "border-[var(--border-subtle)] hover:border-[var(--accent-brass-dim)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      opt.value === "white"
                        ? "bg-[var(--color-board-light)]"
                        : opt.value === "black"
                        ? "bg-[#1a1a1a] border border-[var(--foreground-dim)]"
                        : "bg-gradient-to-br from-[var(--color-board-light)] to-[#1a1a1a]"
                    }`}
                  />
                  <span className="font-medium">{opt.label}</span>
                </div>
                <p className="text-xs text-[var(--foreground-dim)]">{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-sm text-[var(--foreground-dim)]">ระดับความยากของคู่แข่ง (ELO)</p>
            <p className="notation text-lg text-[var(--accent-brass)]">{elo}</p>
          </div>
          <input
            type="range"
            min={800}
            max={2850}
            step={50}
            value={elo}
            onChange={(e) => setElo(Number(e.target.value))}
            className="w-full accent-[var(--accent-brass)]"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {ELO_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setElo(preset)}
                className={`notation text-xs px-2.5 py-1 rounded-full border cursor-pointer ${
                  elo === preset
                    ? "border-[var(--accent-brass)] text-[var(--accent-brass)]"
                    : "border-[var(--border-subtle)] text-[var(--foreground-dim)] hover:border-[var(--accent-brass-dim)]"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => startGame(choice, elo)}
          className="w-full rounded-md bg-[var(--accent-brass)] text-black font-semibold py-3.5 hover:brightness-110 transition-all cursor-pointer"
        >
          เริ่มเกม
        </button>

        <p className="text-xs text-[var(--foreground-dim)] mt-4 leading-relaxed">
          คำแนะนำจาก AI ต้องใช้ Ollama รันอยู่ในเครื่อง (localhost:11434) พร้อมโมเดลที่ดึงไว้แล้ว
        </p>
      </div>
    </div>
  );
}
