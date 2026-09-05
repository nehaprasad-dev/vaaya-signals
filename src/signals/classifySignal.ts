import { explainChange } from "@/insights/explainChange";
import { suggestAction } from "@/insights/suggestAction";
import type { SignalChange, SignalType, SourceReference } from "@/types/signals";

export interface ChangeCandidate {
  type: SignalType;
  kind: "added" | "removed" | "changed";
  title: string;
  summary: string;
  sources: SourceReference[];
  details: Record<string, unknown>;
}

function scoreCandidate(candidate: ChangeCandidate) {
  switch (candidate.type) {
    case "funding":
      return 95;
    case "product":
      return 86;
    case "pricing":
      return 88;
    case "leadership":
      return 83;
    case "hiring": {
      const rolesAdded = Math.abs(Number(candidate.details.rolesAdded ?? 0));
      return rolesAdded >= 10 ? 78 : 66;
    }
    case "news":
      return 58;
    default:
      return 50;
  }
}

function confidenceForScore(score: number): SignalChange["confidence"] {
  if (score >= 85) {
    return "high";
  }

  if (score >= 70) {
    return "medium";
  }

  return "low";
}

export function classifySignal(candidate: ChangeCandidate): SignalChange {
  const meaningfulnessScore = scoreCandidate(candidate);

  return {
    type: candidate.type,
    title: candidate.title,
    summary: candidate.summary,
    whyItMatters: explainChange(candidate.type, candidate.details, candidate.title),
    nextActions: suggestAction(candidate.type),
    confidence: confidenceForScore(meaningfulnessScore),
    meaningfulnessScore,
    kind: candidate.kind,
    sources: candidate.sources,
  };
}
