import type { SnapshotData } from "@/types/signals";

function baselineSnapshot(name: string, domain: string, url: string): SnapshotData {
  return {
    company: {
      name,
      domain,
      url,
      pricing: [
        { plan: "Growth", monthlyPrice: 99, currency: "USD" },
        { plan: "Scale", monthlyPrice: 249, currency: "USD" },
      ],
      leadership: [
        { name: "Patrick Collison", title: "CEO" },
        { name: "John Collison", title: "President" },
      ],
    },
    profile: {
      summary: `${name} is expanding its infrastructure platform for internet businesses.`,
      employeeCount: 7100,
      enterpriseRoleCount: 12,
      products: ["Payments", "Billing", "Radar"],
    },
    events: [
      {
        id: `${domain}-product-billing`,
        key: "product:billing",
        type: "product",
        title: `${name} Billing remains a featured product`,
        summary: "The baseline product catalog includes Billing as a core offering.",
        date: "2026-08-28",
        metadata: {
          launchType: "existing",
        },
        sources: [
          {
            url: `${url}/billing`,
            title: `${name} Billing`,
          },
        ],
      },
    ],
    sources: [
      {
        url,
        title: `${name} homepage`,
      },
      {
        url: `${url}/pricing`,
        title: `${name} pricing`,
      },
      {
        url: `${url}/careers`,
        title: `${name} careers`,
      },
    ],
  };
}

function secondSnapshot(name: string, domain: string, url: string): SnapshotData {
  return {
    company: {
      name,
      domain,
      url,
      pricing: [
        { plan: "Growth", monthlyPrice: 119, currency: "USD" },
        { plan: "Scale", monthlyPrice: 249, currency: "USD" },
      ],
      leadership: [
        { name: "Patrick Collison", title: "CEO" },
        { name: "John Collison", title: "President" },
      ],
    },
    profile: {
      summary: `${name} is expanding its infrastructure platform for internet businesses.`,
      employeeCount: 7240,
      enterpriseRoleCount: 24,
      products: ["Payments", "Billing", "Radar", "Revenue Insights"],
    },
    events: [
      {
        id: `${domain}-launch-revenue-insights`,
        key: "product:revenue-insights",
        type: "product",
        title: `${name} launched Revenue Insights`,
        summary: "A new analytics product page appeared in the public product catalog.",
        date: "2026-09-01",
        metadata: {
          launchType: "new",
          productName: "Revenue Insights",
        },
        sources: [
          {
            url: `${url}/revenue-insights`,
            title: `${name} Revenue Insights`,
            publishedAt: "2026-09-01",
          },
        ],
      },
    ],
    sources: [
      {
        url,
        title: `${name} homepage`,
      },
      {
        url: `${url}/pricing`,
        title: `${name} pricing`,
      },
      {
        url: `${url}/careers`,
        title: `${name} careers`,
      },
      {
        url: `${url}/revenue-insights`,
        title: `${name} Revenue Insights`,
      },
    ],
  };
}

function thirdSnapshot(name: string, domain: string, url: string): SnapshotData {
  return {
    company: {
      name,
      domain,
      url,
      pricing: [
        { plan: "Growth", monthlyPrice: 119, currency: "USD" },
        { plan: "Scale", monthlyPrice: 279, currency: "USD" },
      ],
      leadership: [
        { name: "Patrick Collison", title: "CEO" },
        { name: "John Collison", title: "President" },
        { name: "Avery Morgan", title: "Chief Revenue Officer" },
      ],
    },
    profile: {
      summary: `${name} is expanding its infrastructure platform for internet businesses.`,
      employeeCount: 7310,
      enterpriseRoleCount: 29,
      products: ["Payments", "Billing", "Radar", "Revenue Insights"],
    },
    events: [
      {
        id: `${domain}-launch-revenue-insights`,
        key: "product:revenue-insights",
        type: "product",
        title: `${name} launched Revenue Insights`,
        summary: "A new analytics product page appeared in the public product catalog.",
        date: "2026-09-01",
        metadata: {
          launchType: "new",
          productName: "Revenue Insights",
        },
        sources: [
          {
            url: `${url}/revenue-insights`,
            title: `${name} Revenue Insights`,
            publishedAt: "2026-09-01",
          },
        ],
      },
      {
        id: `${domain}-leadership-cro`,
        key: "leadership:chief-revenue-officer",
        type: "leadership",
        title: `${name} added a new Chief Revenue Officer`,
        summary: "The leadership team now includes a CRO focused on enterprise growth.",
        date: "2026-09-03",
        metadata: {
          title: "Chief Revenue Officer",
          personName: "Avery Morgan",
        },
        sources: [
          {
            url: `${url}/leadership`,
            title: `${name} leadership`,
            publishedAt: "2026-09-03",
          },
        ],
      },
    ],
    sources: [
      {
        url,
        title: `${name} homepage`,
      },
      {
        url: `${url}/pricing`,
        title: `${name} pricing`,
      },
      {
        url: `${url}/careers`,
        title: `${name} careers`,
      },
      {
        url: `${url}/revenue-insights`,
        title: `${name} Revenue Insights`,
      },
      {
        url: `${url}/leadership`,
        title: `${name} leadership`,
      },
    ],
  };
}

export function getScenarioSnapshot(
  companyName: string,
  domain: string,
  url: string,
  existingSnapshotCount: number,
) {
  const snapshotName = companyName || domain.split(".")[0] || "Company";
  const snapshots = [
    baselineSnapshot(snapshotName, domain, url),
    secondSnapshot(snapshotName, domain, url),
    thirdSnapshot(snapshotName, domain, url),
  ];

  return snapshots[Math.min(existingSnapshotCount, snapshots.length - 1)];
}
