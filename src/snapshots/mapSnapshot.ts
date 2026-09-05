import type { Prisma, Snapshot } from "@prisma/client";
import { fromJsonValue } from "@/lib/json";
import type { SignalChange, SnapshotData, WatchSnapshotSummary } from "@/types/signals";

type SnapshotRecord = Snapshot & {
  data: Prisma.JsonValue;
  changes: Prisma.JsonValue | null;
};

export function mapSnapshot(snapshot: SnapshotRecord): WatchSnapshotSummary {
  return {
    id: snapshot.id,
    capturedAt: snapshot.capturedAt.toISOString(),
    isBaseline: snapshot.isBaseline,
    changeCount: snapshot.changeCount,
    changes: fromJsonValue<SignalChange[]>(snapshot.changes) ?? [],
    data: fromJsonValue<SnapshotData>(snapshot.data),
  };
}
