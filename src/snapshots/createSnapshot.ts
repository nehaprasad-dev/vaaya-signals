import prisma from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/json";
import { mapSnapshot } from "@/snapshots/mapSnapshot";
import type { SignalChange, SnapshotData } from "@/types/signals";

export async function createSnapshot(input: {
  watchId: string;
  data: SnapshotData;
  changes: SignalChange[];
  isBaseline: boolean;
}) {
  const snapshot = await prisma.snapshot.create({
    data: {
      watchId: input.watchId,
      data: toInputJsonValue(input.data),
      changes: toInputJsonValue(input.changes),
      isBaseline: input.isBaseline,
      changeCount: input.changes.length,
    },
  });

  return mapSnapshot(snapshot);
}
