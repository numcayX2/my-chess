"use client";

import { useGameStore } from "@/store/gameStore";
import { CLASS_COLOR } from "@/lib/moveClassifier";

export default function MoveList() {
  const history = useGameStore((s) => s.history);

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

  return (
    <div className="felt-panel rounded-md p-5 flex flex-col h-full">
      <h3 className="font-display text-lg italic mb-3">รายการเดิน</h3>
      <div className="overflow-y-auto flex-1 notation text-sm">
        {rows.length === 0 && (
          <p className="text-[var(--foreground-dim)] text-xs">ยังไม่มีการเดิน</p>
        )}
        {rows.map((row) => (
          <div key={row.num} className="grid grid-cols-[2rem_1fr_1fr] gap-2 py-1">
            <span className="text-[var(--foreground-dim)]">{row.num}.</span>
            <span className={row.white?.classification ? CLASS_COLOR[row.white.classification] : ""}>
              {row.white?.san ?? ""}
            </span>
            <span className={row.black?.classification ? CLASS_COLOR[row.black.classification] : ""}>
              {row.black?.san ?? ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
