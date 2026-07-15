import { Chess } from "chess.js";

/** Convert a UCI move (e.g. "e2e4", "e7e8q") to SAN, given the FEN it applies to. */
export function uciToSan(uci: string | null, fen: string | null): string | null {
  if (!uci || !fen) return null;
  try {
    const temp = new Chess(fen);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci.slice(4) : undefined;
    const move = temp.move({ from, to, promotion });
    return move?.san ?? null;
  } catch {
    return null;
  }
}
