import prisma from "@/lib/prisma";
import { mapSnapshot } from "@/snapshots/mapSnapshot";

export async function listSnapshots(watchId: string) {
  const snapshots = await prisma.snapshot.findMany({
    where: {
      watchId,
    },
    orderBy: {
      capturedAt: "desc",
    },
  });

  return snapshots.map(mapSnapshot);
}
