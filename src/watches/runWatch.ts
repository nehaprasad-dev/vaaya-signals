import prisma from "@/lib/prisma";
import { toJsonValue } from "@/lib/json";
import { createResearchProvider } from "@/providers";
import { createSnapshot } from "@/snapshots/createSnapshot";
import { getLatestSnapshot } from "@/snapshots/getLatestSnapshot";
import { compareSnapshots } from "@/snapshots/compareSnapshots";
import { mapWatch } from "@/watches/mapWatch";

export async function runWatch(id: string) {
  const watch = await prisma.watch.findUnique({
    where: {
      id,
    },
    include: {
      signals: true,
      snapshots: {
        take: 1,
        orderBy: {
          capturedAt: "desc",
        },
      },
      _count: {
        select: {
          snapshots: true,
        },
      },
    },
  });

  if (!watch) {
    throw new Error("Watch not found.");
  }

  const enabledSignals = watch.signals
    .filter((signal) => signal.enabled)
    .map((signal) => signal.signalType);
  const previousSnapshot = await getLatestSnapshot(watch.id);

  const provider = createResearchProvider();
  const currentData = await provider.buildSnapshot({
    companyUrl: watch.companyUrl,
    companyName: watch.companyName,
    enabledSignals,
    existingSnapshotCount: watch._count.snapshots,
    lastSnapshotCapturedAt: previousSnapshot?.capturedAt,
  });

  if (!previousSnapshot) {
    const baselineSnapshot = await createSnapshot({
      watchId: watch.id,
      data: currentData,
      changes: [],
      isBaseline: true,
    });

    await prisma.watch.update({
      where: {
        id: watch.id,
      },
      data: {
        lastCheckedAt: new Date(),
      },
    });

    return {
      watch: mapWatch({
        ...watch,
        lastCheckedAt: new Date(),
        snapshots: [
          {
            id: baselineSnapshot.id,
            watchId: watch.id,
            capturedAt: new Date(baselineSnapshot.capturedAt),
            isBaseline: true,
            data: toJsonValue(baselineSnapshot.data),
            changes: toJsonValue(baselineSnapshot.changes),
            changeCount: baselineSnapshot.changeCount,
          },
        ],
      }),
      snapshot: baselineSnapshot,
      baselineCreated: true,
    };
  }

  const { changes } = compareSnapshots(previousSnapshot.data, currentData);
  const snapshot = await createSnapshot({
    watchId: watch.id,
    data: currentData,
    changes,
    isBaseline: false,
  });

  const updatedWatch = await prisma.watch.update({
    where: {
      id: watch.id,
    },
    data: {
      lastCheckedAt: new Date(snapshot.capturedAt),
    },
    include: {
      signals: true,
      snapshots: {
        take: 1,
        orderBy: {
          capturedAt: "desc",
        },
      },
    },
  });

  return {
    watch: mapWatch(updatedWatch),
    snapshot,
    baselineCreated: false,
  };
}
