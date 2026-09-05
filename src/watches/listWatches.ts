import prisma from "@/lib/prisma";
import { mapWatch } from "@/watches/mapWatch";

export async function listWatches() {
  const watches = await prisma.watch.findMany({
    include: {
      signals: true,
      snapshots: {
        take: 1,
        orderBy: {
          capturedAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return watches.map(mapWatch);
}
