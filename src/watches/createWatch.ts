import { SignalType } from "@prisma/client";
import { toJsonValue } from "@/lib/json";
import prisma from "@/lib/prisma";
import { companyNameFromDomain, normalizeCompanyUrl } from "@/lib/url";
import { createResearchProvider } from "@/providers";
import { createSnapshot } from "@/snapshots/createSnapshot";
import { mapWatch } from "@/watches/mapWatch";
import { createWatchSchema, type CreateWatchInput } from "@/watches/watchSchema";

export async function createWatch(input: CreateWatchInput) {
  const parsed = createWatchSchema.parse(input);
  const { url, domain } = normalizeCompanyUrl(parsed.companyUrl);
  const companyName = parsed.companyName?.trim() || companyNameFromDomain(domain);

  const watch = await prisma.watch.create({
    data: {
      userId: parsed.userId,
      companyUrl: url,
      companyName,
      watchFrequency: parsed.watchFrequency,
      signals: {
        create: parsed.signals.map((signalType) => ({
          signalType: signalType as SignalType,
          enabled: true,
        })),
      },
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

  const provider = createResearchProvider();
  const baseline = await provider.buildSnapshot({
    companyUrl: url,
    companyName,
    enabledSignals: parsed.signals,
    existingSnapshotCount: 0,
    lastSnapshotCapturedAt: undefined,
  });

  const baselineSnapshot = await createSnapshot({
    watchId: watch.id,
    data: baseline,
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
    baselineSnapshot,
  };
}
