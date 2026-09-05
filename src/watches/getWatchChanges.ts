import { getLatestSnapshot } from "@/snapshots/getLatestSnapshot";

export async function getWatchChanges(id: string) {
  const latestSnapshot = await getLatestSnapshot(id);

  if (!latestSnapshot) {
    return {
      baselineCreated: false,
      changes: [],
    };
  }

  return {
    baselineCreated: latestSnapshot.isBaseline,
    changes: latestSnapshot.changes,
    capturedAt: latestSnapshot.capturedAt,
  };
}
