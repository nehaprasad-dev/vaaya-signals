import prisma from "@/lib/prisma";
import { mapSnapshot } from "@/snapshots/mapSnapshot";

export async function getLatestSnapshot(watchId: string) {
  const snapshot = await prisma.snapshot.findFirst({
    where: {
      watchId,
    },
    orderBy: {
      capturedAt: "desc",
    },
  });

  return snapshot ? mapSnapshot(snapshot) : null;
}
