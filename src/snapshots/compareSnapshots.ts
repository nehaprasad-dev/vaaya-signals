import { detectSignals, flattenDiffResult } from "@/signals/detectSignals";
import type { DiffResult, SnapshotData } from "@/types/signals";

export function compareSnapshots(previous: SnapshotData, current: SnapshotData): {
  diff: DiffResult;
  changes: ReturnType<typeof flattenDiffResult>;
} {
  const diff = detectSignals(previous, current);

  return {
    diff,
    changes: flattenDiffResult(diff),
  };
}
