import type { SignalType, SnapshotData } from "@/types/signals";

export interface ProviderSnapshotRequest {
  companyUrl: string;
  companyName: string;
  enabledSignals: SignalType[];
  existingSnapshotCount: number;
  lastSnapshotCapturedAt?: string;
}

export interface PersonCandidate {
  name: string;
  title: string;
  profileUrl?: string;
}

export interface ResearchProvider {
  buildSnapshot(input: ProviderSnapshotRequest): Promise<SnapshotData>;
  findRelevantPeople(companyName: string, signalType: SignalType): Promise<PersonCandidate[]>;
}
