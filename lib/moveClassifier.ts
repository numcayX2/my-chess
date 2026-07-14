// lib/moveClassifier.ts

export interface MoveQualityData {
  evalBefore: number;
  evalAfter: number;
  colorThatMoved: 'w' | 'b';
}

/**
 * Calculates the true delta from the perspective of the player who just moved.
 * A negative return value ALWAYS means the player made a mistake, regardless of color.
 */
export function calculateEvalDelta({ evalBefore, evalAfter, colorThatMoved }: MoveQualityData): number {
  const rawDelta = evalAfter - evalBefore;
  
  // If White moved, they want the evaluation to go UP (more positive).
  // If Black moved, they want the evaluation to go DOWN (more negative).
  return colorThatMoved === 'w' ? rawDelta : -rawDelta;
}

/**
 * Classifies the move based on the calculated delta.
 * These thresholds can be adjusted to make the coach stricter or more lenient.
 */
export function classifyMove(delta: number): string {
  if (delta <= -3.0) return 'Blunder';
  if (delta <= -1.0) return 'Mistake';
  if (delta <= -0.5) return 'Inaccuracy';
  if (delta >= 1.0) return 'Great Move';
  if (delta >= 0.2) return 'Good Move';
  return 'Standard Move';
}