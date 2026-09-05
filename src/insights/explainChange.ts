import type { SignalType } from "@/types/signals";

export function explainChange(
  type: SignalType,
  details: Record<string, unknown>,
  title: string,
) {
  switch (type) {
    case "funding":
      return "Fresh funding usually signals budget, urgency, and a higher willingness to invest in new initiatives.";
    case "hiring": {
      const rolesAdded = Number(details.rolesAdded ?? 0);
      const roleFamily = String(details.roleFamily ?? "key");
      return rolesAdded > 0
        ? `The company appears to be increasing ${roleFamily} capacity, which often points to a stronger GTM or expansion push.`
        : `The company adjusted its ${roleFamily} hiring posture, which can reflect a shift in priorities.`;
    }
    case "product":
      return "New product launches often indicate a new buyer motion, packaging change, or strategic bet worth reacting to quickly.";
    case "pricing":
      return "Pricing updates usually reflect a monetization change, market repositioning, or a push toward higher-value customers.";
    case "leadership":
      return "Leadership changes often precede new budgets, team restructures, or shifts in operating priorities.";
    case "news":
      return `${title} may create a timely opening for relevant outreach if the announcement aligns with your value proposition.`;
    default:
      return "This change could signal a meaningful business shift worth monitoring more closely.";
  }
}
