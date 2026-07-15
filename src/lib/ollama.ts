export type MoveAdviceRequest = {
  fen: string;
  lastMoveSan: string | null;
  moverColor: "w" | "b";
  evalCp: number | null;
  mate: number | null;
  bestMoveSan: string | null;
  classification: string | null;
};

export async function fetchMoveAdvice(payload: MoveAdviceRequest): Promise<string> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Ollama request failed");
  }
  const data = await res.json();
  return data.explanation as string;
}

export type SummaryRequest = {
  pgn: string;
  playerColor: "w" | "b";
  moves: {
    moveNumber: number;
    san: string;
    byColor: "w" | "b";
    classification: string | null;
    evalAfter: number | null;
    mateAfter: number | null;
    bestMoveBefore: string | null;
  }[];
};

export async function fetchGameSummary(payload: SummaryRequest): Promise<string> {
  const res = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Ollama request failed");
  }
  const data = await res.json();
  return data.summary as string;
}
