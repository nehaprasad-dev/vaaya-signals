import { normalizeCompanyUrl } from "@/lib/url";
import type { ResearchProvider } from "@/providers/types";
import { getScenarioSnapshot } from "@/providers/demo/scenarios";
import type { SignalType, SnapshotData } from "@/types/signals";

function filterSnapshot(snapshot: SnapshotData, enabledSignals: SignalType[]): SnapshotData {
  const enabled = new Set(enabledSignals);

  return {
    ...snapshot,
    events: snapshot.events.filter((event) => enabled.has(event.type)),
  };
}

export class DemoResearchProvider implements ResearchProvider {
  async buildSnapshot({
    companyUrl,
    companyName,
    enabledSignals,
    existingSnapshotCount,
  }: {
    companyUrl: string;
    companyName: string;
    enabledSignals: SignalType[];
    existingSnapshotCount: number;
  }) {
    const { domain, url } = normalizeCompanyUrl(companyUrl);
    const snapshot = getScenarioSnapshot(companyName, domain, url, existingSnapshotCount);

    return filterSnapshot(snapshot, enabledSignals);
  }

  async findRelevantPeople(companyName: string, signalType: SignalType) {
    const peopleBySignal: Record<SignalType, Array<{ name: string; title: string }>> = {
      funding: [
        { name: "Riley Carter", title: `${companyName} CFO` },
        { name: "Jordan Lee", title: `${companyName} VP Finance` },
      ],
      hiring: [
        { name: "Avery Morgan", title: `${companyName} Head of Sales` },
        { name: "Taylor Brooks", title: `${companyName} VP Talent` },
      ],
      product: [
        { name: "Jamie Patel", title: `${companyName} VP Product` },
        { name: "Sam Rivera", title: `${companyName} Product Marketing Lead` },
      ],
      pricing: [
        { name: "Casey Nguyen", title: `${companyName} VP Revenue` },
        { name: "Alex Kim", title: `${companyName} Pricing Strategy Lead` },
      ],
      leadership: [
        { name: "Avery Morgan", title: `${companyName} Chief Revenue Officer` },
        { name: "Jamie Patel", title: `${companyName} CEO Office` },
      ],
      news: [
        { name: "Morgan Hall", title: `${companyName} Communications Lead` },
        { name: "Sam Rivera", title: `${companyName} Partnerships Lead` },
      ],
    };

    return peopleBySignal[signalType].map((person) => ({
      ...person,
      profileUrl: `https://linkedin.com/in/${person.name.toLowerCase().replace(/\s+/g, "-")}`,
    }));
  }
}
