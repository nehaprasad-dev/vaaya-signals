export const SIGNAL_TYPES = [
  "funding",
  "hiring",
  "product",
  "pricing",
  "leadership",
  "news",
] as const;

export type SignalType = (typeof SIGNAL_TYPES)[number];

export type DiffKind = "added" | "removed" | "changed" | "unchanged";
export type Confidence = "high" | "medium" | "low";

export interface SourceReference {
  url: string;
  title: string;
  publishedAt?: string;
  snippet?: string;
}

export interface PricingPlan {
  plan: string;
  monthlyPrice: number;
  currency: string;
}

export interface LeadershipEntry {
  name: string;
  title: string;
}

export interface NormalizedEvent {
  id: string;
  key: string;
  type: SignalType;
  title: string;
  summary: string;
  date?: string;
  metadata: Record<string, unknown>;
  sources: SourceReference[];
}

export interface SnapshotData {
  company: {
    name: string;
    domain: string;
    url: string;
    pricing: PricingPlan[];
    leadership: LeadershipEntry[];
  };
  profile: {
    summary: string;
    employeeCount?: number;
    enterpriseRoleCount?: number;
    products: string[];
  };
  events: NormalizedEvent[];
  sources: SourceReference[];
}

export interface SignalChange {
  type: SignalType;
  title: string;
  summary: string;
  whyItMatters: string;
  nextActions: string[];
  confidence: Confidence;
  meaningfulnessScore: number;
  kind: Exclude<DiffKind, "unchanged">;
  sources: SourceReference[];
}

export interface DiffResult {
  added: SignalChange[];
  changed: SignalChange[];
  removed: SignalChange[];
  unchanged: string[];
}

export interface WatchSnapshotSummary {
  id: string;
  capturedAt: string;
  isBaseline: boolean;
  changeCount: number;
  changes: SignalChange[];
  data: SnapshotData;
}

export interface WatchSummary {
  id: string;
  companyName: string;
  companyUrl: string;
  watchFrequency: string;
  status: string;
  createdAt: string;
  lastCheckedAt?: string | null;
  enabledSignals: SignalType[];
  latestSnapshot?: WatchSnapshotSummary;
}
