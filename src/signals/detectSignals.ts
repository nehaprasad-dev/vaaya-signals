import { classifySignal, type ChangeCandidate } from "@/signals/classifySignal";
import { rankSignals } from "@/signals/rankSignals";
import type { DiffResult, NormalizedEvent, PricingPlan, SignalChange, SnapshotData } from "@/types/signals";

function indexEvents(events: NormalizedEvent[]) {
  return new Map(events.map((event) => [event.key, event]));
}

function indexPricing(plans: PricingPlan[]) {
  return new Map(plans.map((plan) => [plan.plan.toLowerCase(), plan]));
}

function detectPricingChanges(previous: SnapshotData, current: SnapshotData): ChangeCandidate[] {
  const previousPricing = indexPricing(previous.company.pricing);
  const currentPricing = indexPricing(current.company.pricing);
  const candidates: ChangeCandidate[] = [];

  for (const [planKey, currentPlan] of currentPricing.entries()) {
    const previousPlan = previousPricing.get(planKey);

    if (!previousPlan) {
      candidates.push({
        type: "pricing",
        kind: "added",
        title: `${currentPlan.plan} pricing added`,
        summary: `${currentPlan.plan} is now listed at ${currentPlan.monthlyPrice} ${currentPlan.currency} per month.`,
        sources: [
          {
            url: `${current.company.url}/pricing`,
            title: `${current.company.name} pricing`,
          },
        ],
        details: {
          plan: currentPlan.plan,
          newPrice: currentPlan.monthlyPrice,
        },
      });
      continue;
    }

    if (previousPlan.monthlyPrice !== currentPlan.monthlyPrice) {
      candidates.push({
        type: "pricing",
        kind: "changed",
        title: `${currentPlan.plan} pricing changed`,
        summary: `${currentPlan.plan} moved from ${previousPlan.monthlyPrice} ${previousPlan.currency} to ${currentPlan.monthlyPrice} ${currentPlan.currency} per month.`,
        sources: [
          {
            url: `${current.company.url}/pricing`,
            title: `${current.company.name} pricing`,
          },
        ],
        details: {
          plan: currentPlan.plan,
          previousPrice: previousPlan.monthlyPrice,
          newPrice: currentPlan.monthlyPrice,
        },
      });
    }
  }

  return candidates;
}

function detectHiringChanges(previous: SnapshotData, current: SnapshotData): ChangeCandidate[] {
  const previousCount = previous.profile.enterpriseRoleCount ?? 0;
  const currentCount = current.profile.enterpriseRoleCount ?? 0;
  const delta = currentCount - previousCount;

  if (delta === 0) {
    return [];
  }

  return [
    {
      type: "hiring",
      kind: "changed",
      title:
        delta > 0
          ? `+${delta} enterprise roles`
          : `${delta} enterprise roles`,
      summary:
        delta > 0
          ? `Open enterprise roles increased from ${previousCount} to ${currentCount}.`
          : `Open enterprise roles decreased from ${previousCount} to ${currentCount}.`,
      sources: [
        {
          url: `${current.company.url}/careers`,
          title: `${current.company.name} careers`,
        },
      ],
      details: {
        rolesAdded: delta,
        roleFamily: "enterprise",
        previousCount,
        currentCount,
      },
    },
  ];
}

function detectEventChanges(previous: SnapshotData, current: SnapshotData): ChangeCandidate[] {
  const previousEvents = indexEvents(previous.events);
  const currentEvents = indexEvents(current.events);
  const candidates: ChangeCandidate[] = [];

  for (const [key, currentEvent] of currentEvents.entries()) {
    const previousEvent = previousEvents.get(key);

    if (!previousEvent) {
      candidates.push({
        type: currentEvent.type,
        kind: "added",
        title: currentEvent.title,
        summary: currentEvent.summary,
        sources: currentEvent.sources,
        details: currentEvent.metadata,
      });
      continue;
    }

    const previousFingerprint = JSON.stringify({
      title: previousEvent.title,
      summary: previousEvent.summary,
      metadata: previousEvent.metadata,
    });
    const currentFingerprint = JSON.stringify({
      title: currentEvent.title,
      summary: currentEvent.summary,
      metadata: currentEvent.metadata,
    });

    if (previousFingerprint !== currentFingerprint) {
      candidates.push({
        type: currentEvent.type,
        kind: "changed",
        title: currentEvent.title,
        summary: currentEvent.summary,
        sources: currentEvent.sources,
        details: currentEvent.metadata,
      });
    }
  }

  return candidates;
}

export function detectSignals(previous: SnapshotData, current: SnapshotData): DiffResult {
  const candidates = [
    ...detectHiringChanges(previous, current),
    ...detectPricingChanges(previous, current),
    ...detectEventChanges(previous, current),
  ];
  const ranked = rankSignals(candidates.map(classifySignal));
  const grouped = ranked.reduce<DiffResult>(
    (result, change) => {
      if (change.kind === "added") {
        result.added.push(change);
      } else if (change.kind === "changed") {
        result.changed.push(change);
      } else {
        result.removed.push(change);
      }

      return result;
    },
    {
      added: [],
      changed: [],
      removed: [],
      unchanged: [],
    },
  );

  return grouped;
}

export function flattenDiffResult(diff: DiffResult): SignalChange[] {
  return [...diff.added, ...diff.changed, ...diff.removed].sort(
    (left, right) => right.meaningfulnessScore - left.meaningfulnessScore,
  );
}
