import type { Prisma, Snapshot, Watch, WatchSignal } from "@prisma/client";
import { mapSnapshot } from "@/snapshots/mapSnapshot";
import type { SignalType, WatchSummary } from "@/types/signals";

type WatchWithRelations = Watch & {
  signals: WatchSignal[];
  snapshots?: Array<
    Snapshot & {
      data: Prisma.JsonValue;
      changes: Prisma.JsonValue | null;
    }
  >;
};

export function mapWatch(watch: WatchWithRelations): WatchSummary {
  return {
    id: watch.id,
    companyName: watch.companyName,
    companyUrl: watch.companyUrl,
    watchFrequency: watch.watchFrequency,
    status: watch.status,
    createdAt: watch.createdAt.toISOString(),
    lastCheckedAt: watch.lastCheckedAt?.toISOString() ?? null,
    enabledSignals: watch.signals
      .filter((signal) => signal.enabled)
      .map((signal) => signal.signalType as SignalType),
    latestSnapshot: watch.snapshots?.[0] ? mapSnapshot(watch.snapshots[0]) : undefined,
  };
}
