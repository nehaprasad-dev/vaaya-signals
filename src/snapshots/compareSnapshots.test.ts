import { describe, expect, it } from "vitest";
import { compareSnapshots } from "./compareSnapshots";
import type { SnapshotData } from "../types/signals";

function buildBaseline(): SnapshotData {
  return {
    company: {
      name: "Stripe",
      domain: "stripe.com",
      url: "https://stripe.com",
      pricing: [{ plan: "Growth", monthlyPrice: 99, currency: "USD" }],
      leadership: [{ name: "Patrick Collison", title: "CEO" }],
    },
    profile: {
      summary: "Baseline",
      employeeCount: 100,
      enterpriseRoleCount: 10,
      products: ["Payments"],
    },
    events: [],
    sources: [],
  };
}

describe("compareSnapshots", () => {
  it("treats the first snapshot as a later diff baseline", () => {
    const previous = buildBaseline();
    const current = {
      ...buildBaseline(),
      profile: {
        ...buildBaseline().profile,
        enterpriseRoleCount: 22,
      },
      company: {
        ...buildBaseline().company,
        pricing: [{ plan: "Growth", monthlyPrice: 119, currency: "USD" }],
      },
      events: [
        {
          id: "product-1",
          key: "product:revenue-insights",
          type: "product" as const,
          title: "Stripe launched Revenue Insights",
          summary: "A new analytics product is now public.",
          metadata: { productName: "Revenue Insights" },
          sources: [
            {
              url: "https://stripe.com/revenue-insights",
              title: "Revenue Insights",
            },
          ],
        },
      ],
    };
    const result = compareSnapshots(previous, current);

    expect(result.changes).toHaveLength(3);
    expect(result.changes.map((change) => change.type)).toEqual([
      "pricing",
      "product",
      "hiring",
    ]);
  });

  it("filters out low-value noise below the threshold", () => {
    const previous = buildBaseline();
    const current = {
      ...buildBaseline(),
      events: [
        {
          id: "news-1",
          key: "news:minor-mention",
          type: "news" as const,
          title: "Small press mention",
          summary: "A brief mention appeared in a minor roundup.",
          metadata: {},
          sources: [
            {
              url: "https://example.com/news",
              title: "Minor roundup",
            },
          ],
        },
      ],
    };
    const result = compareSnapshots(previous, current);

    expect(result.changes).toHaveLength(0);
  });
});
