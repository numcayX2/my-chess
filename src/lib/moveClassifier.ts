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

export const CLASS_LABEL_TH: Record<MoveClass, string> = {
  best: "เดินดีที่สุด",
  excellent: "ดีเยี่ยม",
  good: "ดี",
  inaccuracy: "ไม่แม่นยำ",
  mistake: "พลาด",
  blunder: "พลาดร้ายแรง",
  book: "หมากเปิด",
};

export const CLASS_COLOR: Record<MoveClass, string> = {
  best: "text-[#EAECF0]",
  excellent: "text-[#EAECF0]",
  good: "text-[#EAECF0]/70",
  inaccuracy: "text-[#FE7F2D]/60",
  mistake: "text-[#FE7F2D]/85",
  blunder: "text-[#FE7F2D] font-semibold",
  book: "text-[#EAECF0]/40",
};
