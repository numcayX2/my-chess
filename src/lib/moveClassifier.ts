import type { MoveClass, PlayerColor } from "@/store/gameStore";

const MATE_SCORE = 100000;

/** Convert an eval (cp, from White's perspective) plus mate info into one comparable number. */
export function toComparable(cp: number | null, mate: number | null): number {
  if (mate !== null) {
    return mate > 0 ? MATE_SCORE - mate : -MATE_SCORE - mate;
  }
  return cp ?? 0;
}

/**
 * Classify a move for the player who just moved (`mover`), based on the
 * evaluation swing from White's perspective before -> after their move.
 */
export function classifyMove(
  mover: PlayerColor,
  cpBefore: number | null,
  mateBefore: number | null,
  cpAfter: number | null,
  mateAfter: number | null,
  wasBestMove: boolean
): MoveClass {
  if (wasBestMove) return "best";

  const before = toComparable(cpBefore, mateBefore);
  const after = toComparable(cpAfter, mateAfter);

  // Swing measured from the mover's own point of view (positive = good for mover)
  const sign = mover === "w" ? 1 : -1;
  const swing = (after - before) * sign;

  // swing <= 0 means the position got worse (or unchanged) for the mover after their move
  const loss = -swing;

  if (loss <= 10) return "excellent";
  if (loss <= 30) return "good";
  if (loss <= 90) return "inaccuracy";
  if (loss <= 200) return "mistake";
  return "blunder";
}

// ลำดับประเภทการเดินหมาก
export type MoveClassification =
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export const CLASS_LABEL_TH: Record<MoveClassification, string> = {
  brilliant: "ยอดเยี่ยมที่สุด",
  great: "เยี่ยมมาก",
  best: "ดีที่สุด",
  excellent: "เยี่ยม",
  good: "ดี",
  inaccuracy: "ไม่แม่นยำ",
  mistake: "ผิดพลาด",
  blunder: "ผิดพลาดร้ายแรง",
};

// Map สี Badge ตามคุณภาพการเดินหมาก (สไตล์ Tactical Cyber-Retro)
export const CLASS_COLOR: Record<MoveClassification, string> = {
  // ── กลุ่มยอดเยี่ยม (Cyan / Phosphor Lime Highlights) ────────────────
  brilliant:
    "border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/15 shadow-[0_0_12px_rgba(0,229,255,0.3)] font-black",
  great:
    "border-[var(--accent-lime)] text-[var(--accent-lime)] bg-[var(--accent-lime)]/15 font-black",
  best:
    "border-[var(--accent-lime)] text-[var(--accent-lime)] bg-[var(--accent-lime)]/10 font-bold",
  excellent:
    "border-[var(--accent-lime)] text-[var(--accent-lime)] bg-transparent font-bold",

  // ── กลุ่มปานกลาง / ปกติ (Off-white Neutral) ────────────────────────
  good:
    "border-[var(--foreground-dim)] text-[var(--foreground)] bg-transparent font-medium",

  // ── กลุ่มเตือนภัย / พลาด (Warning Orange & Crimson) ─────────────
  inaccuracy:
    "border-[var(--accent-orange)] text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 font-bold",
  mistake:
    "border-[var(--accent-crimson)] text-[var(--accent-crimson)] bg-[var(--accent-crimson)]/15 font-bold",
  blunder:
    "border-[var(--accent-crimson)] text-black bg-[var(--accent-crimson)] font-black animate-pulse",
};
