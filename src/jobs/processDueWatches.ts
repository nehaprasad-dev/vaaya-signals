import prisma from "@/lib/prisma";
import { runWatch } from "@/watches/runWatch";
import { isWatchDue } from "@/watches/isWatchDue";

export async function processDueWatches(now = new Date()) {
  const watches = await prisma.watch.findMany({
    where: {
      status: "active",
    },
    select: {
      id: true,
      watchFrequency: true,
      lastCheckedAt: true,
    },
  });

  const dueWatches = watches.filter((watch) =>
    isWatchDue(watch.lastCheckedAt, watch.watchFrequency, now),
  );
  const results = [];

  for (const watch of dueWatches) {
    results.push(await runWatch(watch.id));
  }

  return {
    processed: results.length,
    results,
  };
}
