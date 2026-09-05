import prisma from "@/lib/prisma";
import { mapWatch } from "@/watches/mapWatch";

export async function getWatch(id: string) {
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
    },
  });

  return watch ? mapWatch(watch) : null;
}
