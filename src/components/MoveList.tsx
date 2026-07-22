"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGameStore } from "@/store/gameStore";
import { CLASS_COLOR } from "@/lib/moveClassifier";

gsap.registerPlugin(useGSAP);

export default function MoveList() {
  const history = useGameStore((s) => s.history);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Pair up moves into (white, black) rows by move number.
  const rows: { num: number; white?: typeof history[number]; black?: typeof history[number] }[] = [];
  for (const point of history) {
    let row = rows.find((r) => r.num === point.moveNumber);
    if (!row) {
      row = { num: point.moveNumber };
      rows.push(row);
    }
    if (point.byColor === "w") row.white = point;
    else row.black = point;
  }

  // Animate new rows on history change
  useEffect(() => {
    const lastIdx = rows.length - 1;
    const lastRow = rowRefs.current[lastIdx];
    if (lastRow) {
      gsap.fromTo(
        lastRow,
        { opacity: 0, x: -8, backgroundColor: "rgba(255, 214, 0, 0.1)" },
        { opacity: 1, x: 0, backgroundColor: "transparent", duration: 0.2, ease: "power2.out" }
      );
    }
  }, [history.length]);

  // Initial stagger animation
  useGSAP(() => {
    if (rowRefs.current.length > 0 && listRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          rowRefs.current.filter(Boolean),
          { opacity: 0, y: 4 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out", stagger: 0.03 }
        );
      }, listRef);
      return () => ctx.revert();
    }
  }, []);

  return (
    <div className="h-full flex flex-col p-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-heavy)]">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-[var(--accent-orange)]" />
          <h3 className="font-display text-base font-black italic uppercase tracking-tight text-[var(--foreground)]">
            รายการเดิน
          </h3>
        </div>
        <span className="pixel-text text-[9px] text-[var(--foreground-dim)]">
          {rows.length > 0 ? `${rows.length} MOVES` : "EMPTY"}
        </span>
      </div>

      {/* Move List */}
      <div ref={listRef} className="overflow-y-auto flex-1 notation text-sm">
        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
            <span className="pixel-text text-lg text-[var(--foreground-muted)]">---</span>
            <p className="text-xs text-[var(--foreground-dim)]">ยังไม่มีการเดิน</p>
          </div>
        )}
        
        {rows.map((row, idx) => (
          <div 
            key={row.num}
            ref={(el) => { rowRefs.current[idx] = el; }}
            className="grid grid-cols-[2.5rem_1fr_1fr] gap-2 py-1.5 px-2 border-b border-[var(--border-heavy)]/50 hover:bg-[var(--bg-panel-raised)]/30 transition-colors duration-100"
          >
            <span className="pixel-text text-[10px] text-[var(--foreground-dim)] pt-0.5">
              {row.num.toString().padStart(2, "0")}.
            </span>
            
            <span className={row.white?.classification ? CLASS_COLOR[row.white.classification] : "text-[var(--foreground)]"}>
              {row.white?.san ? (
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 ${row.white.byColor === "w" ? "bg-[var(--foreground)]" : "bg-[var(--foreground-dim)]"}`} />
                  {row.white.san}
                </span>
              ) : (
                ""
              )}
            </span>
            
            <span className={row.black?.classification ? CLASS_COLOR[row.black.classification] : "text-[var(--foreground)]"}>
              {row.black?.san ? (
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 ${row.black.byColor === "b" ? "bg-[var(--foreground-dim)]" : "bg-[var(--foreground)]"}`} />
                  {row.black.san}
                </span>
              ) : (
                ""
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-[var(--border-heavy)] flex items-center justify-between">
        <span className="pixel-text text-[9px] text-[var(--foreground-muted)]">
          MOVE_LOG
        </span>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 bg-[var(--accent-lime)]" title="Good" />
          <span className="w-1.5 h-1.5 bg-[var(--accent-hazard)]" title="Book" />
          <span className="w-1.5 h-1.5 bg-[var(--accent-orange)]" title="Inaccuracy" />
          <span className="w-1.5 h-1.5 bg-[var(--accent-crimson)]" title="Mistake/Blunder" />
        </div>
      </div>
    </div>
  );
}