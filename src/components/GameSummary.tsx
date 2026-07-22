"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
import {
  CLASS_LABEL_TH,
  CLASS_COLOR,
  toComparable,
} from "@/lib/moveClassifier";
import { uciToSan } from "@/lib/chessUtils";
import { fetchGameSummary } from "@/lib/ollama";

gsap.registerPlugin(useGSAP);

export default function GameSummary() {
  const history = useGameStore((s) => s.history);
  const playerColor = useGameStore((s) => s.playerColor);
  const gameOverReason = useGameStore((s) => s.gameOverReason);
  const summary = useGameStore((s) => s.summary);
  const setSummary = useGameStore((s) => s.setSummary);
  const resetToSetup = useGameStore((s) => s.resetToSetup);
  const requestedRef = useRef(false);

  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(
    () =>
      history.map((p, idx) => ({
        ply: idx + 1,
        eval: Math.max(
          -800,
          Math.min(800, toComparable(p.evalAfter, p.mateAfter)),
        ),
        san: p.san,
      })),
    [history],
  );

  const flagged = useMemo(
    () =>
      history.filter(
        (p) =>
          p.byColor === playerColor &&
          p.classification &&
          ["mistake", "blunder", "inaccuracy"].includes(p.classification),
      ),
    [history, playerColor],
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

  // Snappy Tactical Animations
  useGSAP(
    () => {
      const activeSections = sectionsRef.current.filter(
        (el): el is HTMLElement => el !== null,
      );

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // 1. Header Entrance
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -12, skewX: -2 },
        { opacity: 1, y: 0, skewX: 0, duration: 0.2 },
      )
        // 2. Tactical Panels Stagger
        .fromTo(
          activeSections,
          { opacity: 0, y: 16, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.2,
            stagger: 0.08,
          },
          "-=0.05",
        )
        // 3. Chart Fade & Slide
        .fromTo(
          chartRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.25 },
          "-=0.1",
        )
        // 4. CTA Slide-in
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.2 },
          "-=0.1",
        );
    },
    { scope: mainRef },
  );

  return (
    <main
      ref={mainRef}
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12"
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        {/* ── Header ──────────────────────────────────── */}
        <header
          ref={headerRef}
          className="flex flex-col gap-3 pb-6 border-b-2 border-[var(--border-heavy)] opacity-0"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-none bg-[var(--accent-crimson)] animate-pulse" />
            <span className="pixel-text text-[10px] tracking-[0.3em] text-[var(--accent-crimson)] uppercase font-bold">
              SESSION // TERMINATED
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-[var(--foreground)]">
            สรุปผลเกม
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <span className="notation text-xs font-semibold text-[var(--foreground)] bg-[var(--bg-panel-raised)] px-3 py-1 border border-[var(--border-heavy)]">
              {gameOverReason}
            </span>
            <span className="pixel-text text-[10px] tracking-wider text-[var(--accent-orange)] uppercase font-bold">
              {history.length} PLYS EXECUTED
            </span>
          </div>
        </header>

        {/* ── Eval Chart ──────────────────────────────── */}
        <section
          ref={(el) => {
            sectionsRef.current[0] = el;
          }}
          className="tactical-panel p-5 sm:p-6 flex flex-col gap-4 opacity-0"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-4 bg-[var(--accent-cyan)]" />
            <h2 className="font-display text-base sm:text-lg font-black italic uppercase tracking-tight text-[var(--foreground)]">
              กราฟความได้เปรียบ
            </h2>
          </div>

          <div
            ref={chartRef}
            className="w-full h-[200px] sm:h-[220px] -ml-2 opacity-0"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="ply"
                  tick={{
                    fontSize: 10,
                    fill: "var(--foreground-dim)",
                    fontFamily: "var(--font-mono-notation)",
                  }}
                  axisLine={{ stroke: "var(--border-heavy)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[-800, 800]}
                  tick={{
                    fontSize: 10,
                    fill: "var(--foreground-dim)",
                    fontFamily: "var(--font-mono-notation)",
                  }}
                  width={40}
                  axisLine={{ stroke: "var(--border-heavy)" }}
                  tickLine={false}
                />
                <ReferenceLine
                  y={0}
                  stroke="var(--accent-orange)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <Tooltip
                  cursor={{
                    stroke: "var(--foreground-dim)",
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    background: "var(--bg-panel)",
                    border: "2px solid var(--border-heavy)",
                    borderRadius: 0,
                    fontSize: 12,
                    fontFamily: "var(--font-mono-notation)",
                    boxShadow: "4px 4px 0px rgba(0,0,0,0.8)",
                    color: "var(--foreground)",
                  }}
                  labelFormatter={(ply) => `PLY ${ply}`}
                  formatter={(value, _name, item) => [
                    (Number(value) / 100).toFixed(2),
                    (item?.payload as { san?: string } | undefined)?.san ?? "",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="eval"
                  stroke="var(--accent-hazard)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 0,
                    fill: "var(--accent-hazard)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── AI Coach Summary ────────────────────────── */}
        <section
          ref={(el) => {
            sectionsRef.current[1] = el;
          }}
          className="tactical-panel p-5 sm:p-6 flex flex-col gap-4 opacity-0"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-4 bg-[var(--accent-lime)]" />
            <h2 className="font-display text-base sm:text-lg font-black italic uppercase tracking-tight text-[var(--foreground)]">
              บทวิเคราะห์จากโค้ช AI
            </h2>
          </div>

          {summary?.loading ? (
            <div className="flex items-center gap-3 text-[var(--foreground-dim)] text-sm py-4">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 bg-[var(--accent-lime)] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-[var(--accent-lime)] animate-bounce"
                  style={{ animationDelay: "100ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-[var(--accent-lime)] animate-bounce"
                  style={{ animationDelay: "200ms" }}
                />
              </div>
              <span className="pixel-text text-[10px] tracking-wider animate-pulse font-bold text-[var(--accent-lime)]">
                GENERATING_ANALYSIS...
              </span>
            </div>
          ) : (
            <div className="bg-[var(--bg-panel-raised)]/60 p-4 border border-[var(--border-heavy)] relative overflow-hidden">
              <p className="text-sm leading-[1.8] whitespace-pre-line text-[var(--foreground)] font-medium">
                {summary?.text || "ยังไม่มีบทสรุป"}
              </p>
            </div>
          )}
        </section>

        {/* ── Flagged Mistakes ────────────────────────── */}
        <section
          ref={(el) => {
            sectionsRef.current[2] = el;
          }}
          className="tactical-panel p-5 sm:p-6 flex flex-col gap-4 opacity-0"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[var(--accent-crimson)]" />
              <h2 className="font-display text-base sm:text-lg font-black italic uppercase tracking-tight text-[var(--foreground)]">
                จุดที่ควรแก้ไข
              </h2>
            </div>
            {flagged.length > 0 && (
              <span className="notation text-[11px] font-black px-3 py-0.5 border-2 border-[var(--accent-crimson)] text-[var(--accent-crimson)] bg-[var(--accent-crimson)]/10">
                {flagged.length} ISSUES
              </span>
            )}
          </div>

          {flagged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <span className="pixel-text text-2xl font-bold text-[var(--accent-lime)]">
                [ OK ]
              </span>
              <p className="text-sm text-[var(--foreground-dim)] font-medium">
                ไม่มีจุดพลาดสำคัญ เล่นได้ดีมาก
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--border-heavy)]">
              {flagged.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 hover:bg-[var(--bg-panel-raised)]/40 px-2 -mx-2 transition-colors duration-100"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="pixel-text text-[10px] font-bold text-[var(--accent-orange)]">
                        MOVE {p.moveNumber}
                      </span>
                      <span className="notation text-sm font-bold text-[var(--foreground)] truncate">
                        {p.san}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--foreground-dim)] truncate">
                      ควรเดิน{" "}
                      <span className="text-[var(--foreground)] font-semibold">
                        {uciToSan(p.bestMoveBefore, p.fenBefore) ?? "-"}
                      </span>{" "}
                      แทน
                    </p>
                  </div>

                  <span
                    className={`shrink-0 notation text-[10px] font-black px-2.5 py-1 border-2 uppercase ${
                      p.classification ? CLASS_COLOR[p.classification] : ""
                    }`}
                  >
                    {p.classification ? CLASS_LABEL_TH[p.classification] : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── CTA Button ─────────────────────────────── */}
        <div
          ref={ctaRef}
          className="pt-2 pb-8 sticky bottom-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)] to-transparent opacity-0 z-20"
        >
          <button
            onClick={resetToSetup}
            className="w-full tactical-btn-primary text-base py-4 relative overflow-hidden group cursor-pointer border-2 border-black"
          >
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-100" />
            <span className="relative z-10 tracking-[0.15em] font-black uppercase">
              [ เล่นเกมใหม่ ]
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
