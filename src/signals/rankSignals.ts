import type { SignalChange } from "@/types/signals";

const DEFAULT_THRESHOLD = 60;
const DEFAULT_LIMIT = 3;

export function rankSignals(
  signals: SignalChange[],
  options?: {
    threshold?: number;
    limit?: number;
  },
) {
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;
  const limit = options?.limit ?? DEFAULT_LIMIT;

  return signals
    .filter((signal) => signal.meaningfulnessScore >= threshold)
    .sort((left, right) => right.meaningfulnessScore - left.meaningfulnessScore)
    .slice(0, limit);
}
