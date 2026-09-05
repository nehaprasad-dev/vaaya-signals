import type { SignalType } from "@/types/signals";

export function suggestAction(type: SignalType) {
  switch (type) {
    case "funding":
      return [
        "Find the finance or strategy lead tied to the raise",
        "Check whether the company is expanding into a new market",
        "Draft outreach around speed, scale, or execution after funding",
      ];
    case "hiring":
      return [
        "Identify the hiring manager or sales leadership behind the new roles",
        "Research which team or market the roles support",
        "Prepare outreach tied to scaling or ramp efficiency",
      ];
    case "product":
      return [
        "Research the new product's target user and positioning",
        "Find the product or GTM owner connected to the launch",
        "Create outreach around faster adoption or go-to-market execution",
      ];
    case "pricing":
      return [
        "Review the pricing page to see which plans changed",
        "Check whether the company is moving upmarket or changing packaging",
        "Build outreach around pricing communication or conversion impact",
      ];
    case "leadership":
      return [
        "Identify the new leader and their mandate",
        "Review recent interviews or announcements for stated priorities",
        "Create outreach that maps to the leader's likely first initiatives",
      ];
    case "news":
      return [
        "Read the source in detail to confirm the business impact",
        "Find the team most likely connected to the announcement",
        "Draft outreach only if the change creates a clear use case",
      ];
    default:
      return [
        "Verify the change against the source",
        "Find the relevant owner inside the company",
        "Prepare a short, relevant outreach angle",
      ];
  }
}
