"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { useGameStore } from "@/store/gameStore";
import { CLASS_LABEL_TH, CLASS_COLOR, toComparable } from "@/lib/moveClassifier";
import { uciToSan } from "@/lib/chessUtils";
import { fetchGameSummary } from "@/lib/ollama";

export default function GameSummary() {
  const history = useGameStore((s) => s.history);
  const playerColor = useGameStore((s) => s.playerColor);
  const gameOverReason = useGameStore((s) => s.gameOverReason);
  const summary = useGameStore((s) => s.summary);
  const setSummary = useGameStore((s) => s.setSummary);
  const resetToSetup = useGameStore((s) => s.resetToSetup);
  const requestedRef = useRef(false);

  const chartData = useMemo(
    () =>
      history.map((p, idx) => ({
        ply: idx + 1,
        eval: Math.max(-800, Math.min(800, toComparable(p.evalAfter, p.mateAfter))),
        san: p.san,
      })),
    [history]
  );

  const flagged = useMemo(
    () =>
      history.filter(
        (p) =>
          p.byColor === playerColor &&
          p.classification &&
          ["mistake", "blunder", "inaccuracy"].includes(p.classification)
      ),
    [history, playerColor]
  );

  async function generateSummary() {
    setSummary({ text: "", loading: true });
    try {
      const store = useGameStore.getState();
      const text = await fetchGameSummary({
        pgn: store.game.pgn(),
        playerColor,
        moves: history.map((h) => ({
          moveNumber: h.moveNumber,
          san: h.san,
          byColor: h.byColor,
          classification: h.classification,
          evalAfter: h.evalAfter,
          mateAfter: h.mateAfter,
          bestMoveBefore: h.bestMoveBefore,
        })),
      });
      setSummary({ text, loading: false });
    } catch (err) {
      setSummary({
        text: err instanceof Error ? err.message : "เรียก Ollama ไม่สำเร็จ",
        loading: false,
      });
    }
  }

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    void generateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 flex justify-center">
      <div className="w-full max-w-3xl">
        <p className="notation text-xs tracking-[0.3em] text-[var(--accent-brass)] mb-2">
          GAME OVER
        </p>
        <h1 className="font-display text-4xl italic mb-2">สรุปผลเกม</h1>
        <p className="text-[var(--foreground-dim)] mb-8">{gameOverReason}</p>

        <div className="felt-panel rounded-md p-6 mb-6">
          <h2 className="font-display text-lg italic mb-4">
            กราฟความได้เปรียบตลอดเกม
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="ply" tick={{ fontSize: 10, fill: "var(--foreground-dim)" }} />
              <YAxis
                domain={[-800, 800]}
                tick={{ fontSize: 10, fill: "var(--foreground-dim)" }}
                width={40}
              />
              <ReferenceLine y={0} stroke="var(--border-subtle)" />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-panel-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(ply) => `ตาที่ ${ply}`}
                formatter={(value, _name, item) => [
                  (Number(value) / 100).toFixed(2),
                  (item?.payload as { san?: string } | undefined)?.san ?? "",
                ]}
              />
              <Line
                type="monotone"
                dataKey="eval"
                stroke="var(--accent-brass)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="felt-panel rounded-md p-6 mb-6">
          <h2 className="font-display text-lg italic mb-4">บทวิเคราะห์จากโค้ช AI</h2>
          {summary?.loading ? (
            <div className="flex items-center gap-2 text-[var(--foreground-dim)] text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-brass)] animate-pulse" />
              กำลังสรุปเกมด้วย Ollama...
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {summary?.text || "ยังไม่มีบทสรุป"}
            </p>
          )}
        </div>

        <div className="felt-panel rounded-md p-6 mb-8">
          <h2 className="font-display text-lg italic mb-4">
            จุดที่ควรแก้ไข ({flagged.length})
          </h2>
          {flagged.length === 0 ? (
            <p className="text-sm text-[var(--foreground-dim)]">ไม่มีจุดพลาดสำคัญ เล่นได้ดีมาก</p>
          ) : (
            <div className="flex flex-col gap-3">
              {flagged.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 last:border-0"
                >
                  <div>
                    <p className="notation text-sm">
                      ตาที่ {p.moveNumber} · {p.san}
                    </p>
                    <p className="text-xs text-[var(--foreground-dim)] mt-0.5">
                      ควรเดิน {uciToSan(p.bestMoveBefore, p.fenBefore) ?? "-"} แทน
                    </p>
                  </div>
                  <span
                    className={`notation text-xs px-2.5 py-1 rounded-full border border-[var(--border-subtle)] ${
                      p.classification ? CLASS_COLOR[p.classification] : ""
                    }`}
                  >
                    {p.classification ? CLASS_LABEL_TH[p.classification] : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={resetToSetup}
          className="w-full rounded-md bg-[var(--accent-brass)] text-black font-semibold py-3.5 hover:brightness-110 transition-all cursor-pointer"
        >
          เล่นเกมใหม่
        </button>
      </div>
    </div>
  );
}
