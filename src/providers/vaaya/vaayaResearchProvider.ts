import type { PersonCandidate } from "@/providers/types";
import type { ProviderSnapshotRequest, ResearchProvider } from "@/providers/types";
import { normalizeCompanyUrl } from "@/lib/url";
import { plainText } from "@/lib/format";
import { VaayaClient } from "@/providers/vaaya/vaayaClient";
import type {
  NormalizedEvent,
  PricingPlan,
  SignalType,
  SnapshotData,
  SourceReference,
} from "@/types/signals";

type JsonRecord = Record<string, unknown>;

interface OneSearchEvidence extends JsonRecord {
  url?: string;
  title?: string;
  snippet?: string;
  published_at?: string;
  publishedAt?: string;
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(normalized) ? normalized : undefined;
  }

  return undefined;
}

function extractRows<T = JsonRecord>(data: unknown, preferredKeys: string[] = []): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  const record = asRecord(data);

  if (!record) {
    return [];
  }

  for (const key of preferredKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
}

function extractFirstRow(data: unknown) {
  return extractRows(data, ["rows", "results", "companies", "items"])[0] ?? null;
}

function makeSource(input: {
  url?: string;
  title?: string;
  snippet?: string;
  publishedAt?: string;
}): SourceReference | null {
  if (!input.url) {
    return null;
  }

  return {
    url: input.url,
    title: input.title ? plainText(input.title) : input.url,
    snippet: input.snippet ? plainText(input.snippet) : undefined,
    publishedAt: input.publishedAt,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSources(sources: Array<SourceReference | null>) {
  const seen = new Set<string>();
  const unique: SourceReference[] = [];

  for (const source of sources) {
    if (!source || seen.has(source.url)) {
      continue;
    }

    seen.add(source.url);
    unique.push(source);
  }

  return unique;
}

function parsePublishedAt(record: JsonRecord) {
  return (
    asString(record.published_at) ??
    asString(record.publishedAt) ??
    asString(record.date) ??
    asString(record.announced_date) ??
    asString(record.created_at)
  );
}

function parsePricingFromContent(content: string): PricingPlan[] {
  const plans: PricingPlan[] = [];
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = lines[index] ?? "";
    const nextLine = lines[index + 1] ?? "";
    const currentPrice = currentLine.match(/\$([0-9]+(?:\.[0-9]{1,2})?)/);
    const nextPrice = nextLine.match(/\$([0-9]+(?:\.[0-9]{1,2})?)/);
    const plan = currentPrice && !currentLine.startsWith("$")
      ? currentLine
      : nextPrice
        ? currentLine
        : "";
    const price = currentPrice?.[1] ?? nextPrice?.[1];

    if (!plan || !price) {
      continue;
    }

    const monthlyPrice = Number.parseFloat(price);

    if (!Number.isFinite(monthlyPrice)) {
      continue;
    }

    plans.push({
      plan: plan.replace(/^#+\s*/, "").trim(),
      monthlyPrice,
      currency: "USD",
    });
  }

  return plans.slice(0, 6);
}

function estimateRecencyDays(lastSnapshotCapturedAt?: string) {
  if (!lastSnapshotCapturedAt) {
    return 365;
  }

  const diffMs = Date.now() - new Date(lastSnapshotCapturedAt).getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(14, Math.min(365, diffDays + 7));
}

function inferProductName(title: string) {
  const cleaned = title.replace(/^[A-Z][^:]+:\s*/, "").trim();
  const launchMatch =
    cleaned.match(/launch(?:ed|es)?\s+(.+)/i) ??
    cleaned.match(/introduc(?:ed|es)\s+(.+)/i) ??
    cleaned.match(/announce(?:d|s)\s+(.+)/i);

  return launchMatch?.[1]?.trim().replace(/[.]+$/, "") ?? cleaned;
}

export class VaayaResearchProvider implements ResearchProvider {
  private readonly client = new VaayaClient();

  private async safeFetch<T>(label: string, fallback: T, run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      console.error(`[vaaya] ${label} failed:`, error instanceof Error ? error.message : error);
      return fallback;
    }
  }

  private async fetchCompanyProfile(domain: string) {
    const data = await this.client.run<unknown>("signalbase", "companies", {
      domain,
      limit: 1,
      max_cost_cents: 25,
    });

    return asRecord(extractFirstRow(data));
  }

  private async fetchFundingSignals(domain: string) {
    const data = await this.client.run<unknown>("signalbase", "funding", {
      company_domain: domain,
      limit: 20,
      date_preset: "last_1y",
      max_cost_cents: 25,
    });

    return extractRows<JsonRecord>(data, ["data", "rows", "results", "funding", "items"]);
  }

  private async fetchHiringSignals(domain: string, lastSnapshotCapturedAt?: string) {
    const recencyDays = estimateRecencyDays(lastSnapshotCapturedAt);
    const datePreset =
      recencyDays <= 30
        ? "last_30d"
        : recencyDays <= 90
          ? "last_90d"
          : "last_1y";

    const data = await this.client.run<unknown>("signalbase", "hiring", {
      company_domain: domain,
      limit: 50,
      date_preset: datePreset,
      max_cost_cents: 25,
    });

    return extractRows<JsonRecord>(data, ["data", "rows", "results", "hiring", "items"]);
  }

  private async fetchLeadershipSignals(domain: string, lastSnapshotCapturedAt?: string) {
    const recencyDays = estimateRecencyDays(lastSnapshotCapturedAt);
    const datePreset =
      recencyDays <= 90
        ? "last_90d"
        : "last_1y";

    const data = await this.client.run<unknown>("signalbase", "job-changes", {
      company_domain: domain,
      limit: 15,
      date_preset: datePreset,
      max_cost_cents: 25,
    });

    return extractRows<JsonRecord>(data, ["data", "rows", "results", "job_changes", "items"]);
  }

  private async fetchResearchEvidence(
    companyName: string,
    domain: string,
    enabledSignals: SignalType[],
    lastSnapshotCapturedAt?: string,
  ) {
    const recencyDays = estimateRecencyDays(lastSnapshotCapturedAt);
    const requests: Array<Promise<unknown>> = [];

    if (enabledSignals.includes("product") || enabledSignals.includes("news")) {
      requests.push(
        this.client.run("vaaya", "onesearch", {
          query: `${companyName} ${domain} product launches announcements news`,
          facets: ["web", "news"],
          timeCritical: true,
          fidelityRequired: true,
          domains: [domain],
          recencyDays,
          maxResults: 8,
          max_cost_cents: 20,
        }),
      );
    }

    const results = await Promise.all(requests);
    return results.flatMap((result) =>
      extractRows<OneSearchEvidence>(asRecord(result)?.evidence ?? result, [
        "evidence",
        "results",
        "items",
      ]),
    );
  }

  private async fetchPricingPage(url: string) {
    try {
      const data = await this.client.run<unknown>("firecrawl", "scrape", {
        url: `${url.replace(/\/$/, "")}/pricing`,
        formats: ["markdown"],
        onlyMainContent: true,
        max_cost_cents: 5,
      });
      const record = asRecord(data);

      return (
        asString(record?.markdown) ??
        asString(record?.content) ??
        asString(asRecord(record?.data)?.markdown) ??
        asString(record?.data) ??
        ""
      );
    } catch {
      return "";
    }
  }

  private mapFundingEvents(rows: JsonRecord[]): NormalizedEvent[] {
    return rows
      .map((row) => {
        const companyName = asString(row.company_name) ?? asString(row.name) ?? "Company";
        const round = asString(row.round) ?? "Funding round";
        const amount = asString(row.amount) ?? asString(row.amount_display);
        const date = parsePublishedAt(row);
        const url =
          asString(row.source_url) ??
          asString(row.url) ??
          asString(row.article_url);
        const source = makeSource({
          url,
          title: asString(row.source_title) ?? `${companyName} funding`,
          publishedAt: date,
        });

        return {
          id: `funding:${slugify(companyName)}:${slugify(round)}:${date ?? "unknown"}`,
          key: `funding:${slugify(companyName)}:${slugify(round)}:${date ?? "unknown"}`,
          type: "funding" as const,
          title: amount ? `${companyName} ${round} for ${amount}` : `${companyName} ${round}`,
          summary: `Funding activity was found for ${companyName}.`,
          date,
          metadata: {
            round,
            amount: amount ?? null,
          },
          sources: uniqueSources([source]),
        };
      })
      .filter((event) => event.sources.length > 0 || event.title.length > 0);
  }

  private mapLeadershipEvents(rows: JsonRecord[]): NormalizedEvent[] {
    return rows
      .map((row) => {
        const newRole = asString(row.new_role) ?? asString(row.title) ?? "Leadership change";
        const personName = asString(row.person_name) ?? asString(row.name) ?? "New leader";
        const date = parsePublishedAt(row);
        const url =
          asString(row.source_url) ??
          asString(row.url) ??
          asString(row.company_linkedin_url);
        const source = makeSource({
          url,
          title: asString(row.source_title) ?? `${personName} ${newRole}`,
          publishedAt: date,
        });

        return {
          id: `leadership:${slugify(personName)}:${slugify(newRole)}:${date ?? "unknown"}`,
          key: `leadership:${slugify(personName)}:${slugify(newRole)}:${date ?? "unknown"}`,
          type: "leadership" as const,
          title: `${personName} moved into ${newRole}`,
          summary: `A leadership-related role change was detected for ${personName}.`,
          date,
          metadata: {
            personName,
            title: newRole,
          },
          sources: uniqueSources([source]),
        };
      })
      .filter((event) => event.sources.length > 0);
  }

  private mapResearchEvents(evidence: OneSearchEvidence[], enabledSignals: SignalType[]) {
    const events: NormalizedEvent[] = [];

    for (const item of evidence) {
      const title = plainText(item.title);
      const snippet = plainText(item.snippet);
      const url = item.url?.trim();

      if (!title || !url) {
        continue;
      }

      const combined = `${title} ${snippet}`.toLowerCase();
      const publishedAt = item.published_at ?? item.publishedAt;
      const source = makeSource({
        url,
        title,
        snippet,
        publishedAt,
      });

      if (
        enabledSignals.includes("product") &&
        /(launch|launched|introduc|announce|new product|rollout)/i.test(combined)
      ) {
        const productName = inferProductName(title);
        events.push({
          id: `product:${slugify(url)}`,
          key: `product:${slugify(url)}`,
          type: "product",
          title,
          summary: snippet || `${productName} appears in recent company coverage.`,
          date: publishedAt,
          metadata: {
            productName,
          },
          sources: uniqueSources([source]),
        });
        continue;
      }

      if (enabledSignals.includes("news")) {
        events.push({
          id: `news:${slugify(url)}`,
          key: `news:${slugify(url)}`,
          type: "news",
          title,
          summary: snippet || "Recent coverage mentions the company.",
          date: publishedAt,
          metadata: {},
          sources: uniqueSources([source]),
        });
      }
    }

    return events;
  }

  async buildSnapshot(input: ProviderSnapshotRequest): Promise<SnapshotData> {
    const { domain, url } = normalizeCompanyUrl(input.companyUrl);
    const [
      companyProfile,
      fundingRows,
      hiringRows,
      leadershipRows,
      researchEvidence,
      pricingContent,
    ] = await Promise.all([
      this.safeFetch("companies", null, () => this.fetchCompanyProfile(domain)),
      input.enabledSignals.includes("funding")
        ? this.safeFetch("funding", [], () => this.fetchFundingSignals(domain))
        : Promise.resolve([]),
      input.enabledSignals.includes("hiring")
        ? this.safeFetch("hiring", [], () =>
            this.fetchHiringSignals(domain, input.lastSnapshotCapturedAt),
          )
        : Promise.resolve([]),
      input.enabledSignals.includes("leadership")
        ? this.safeFetch("leadership", [], () =>
            this.fetchLeadershipSignals(domain, input.lastSnapshotCapturedAt),
          )
        : Promise.resolve([]),
      this.safeFetch("onesearch", [], () =>
        this.fetchResearchEvidence(
          input.companyName,
          domain,
          input.enabledSignals,
          input.lastSnapshotCapturedAt,
        ),
      ),
      input.enabledSignals.includes("pricing")
        ? this.fetchPricingPage(url)
        : Promise.resolve(""),
    ]);

    const pricing = parsePricingFromContent(pricingContent);
    const fundingEvents = this.mapFundingEvents(fundingRows);
    const leadershipEvents = this.mapLeadershipEvents(leadershipRows);
    const researchEvents = this.mapResearchEvents(researchEvidence, input.enabledSignals);
    const productNames = [
      ...new Set(
        researchEvents
          .filter((event) => event.type === "product")
          .map((event) => asString(event.metadata.productName))
          .filter((value): value is string => Boolean(value)),
      ),
    ];
    const leadership = leadershipEvents
      .map((event) => ({
        name: asString(event.metadata.personName) ?? event.title,
        title: asString(event.metadata.title) ?? "Leader",
      }))
      .slice(0, 10);
    const companyName =
      asString(companyProfile?.name) ??
      asString(companyProfile?.company_name) ??
      input.companyName;
    const description =
      asString(companyProfile?.description) ??
      asString(companyProfile?.summary) ??
      `${companyName} company snapshot collected via Vaaya.`;
    const employeeCount =
      asNumber(companyProfile?.employee_count) ??
      asNumber(companyProfile?.employees) ??
      undefined;
    const allSources = uniqueSources([
      makeSource({
        url,
        title: `${companyName} homepage`,
      }),
      makeSource({
        url: pricing.length > 0 ? `${url.replace(/\/$/, "")}/pricing` : undefined,
        title: `${companyName} pricing`,
      }),
      ...fundingEvents.flatMap((event) => event.sources),
      ...leadershipEvents.flatMap((event) => event.sources),
      ...researchEvents.flatMap((event) => event.sources),
    ]);

    return {
      company: {
        name: companyName,
        domain,
        url,
        pricing,
        leadership,
      },
      profile: {
        summary: description,
        employeeCount,
        enterpriseRoleCount: hiringRows.length,
        products: productNames,
      },
      events: [...fundingEvents, ...leadershipEvents, ...researchEvents],
      sources: allSources,
    };
  }

  async findRelevantPeople(
    companyName: string,
    signalType: SignalType,
  ): Promise<PersonCandidate[]> {
    const queryBySignal: Record<SignalType, string> = {
      funding: `finance leaders at ${companyName}`,
      hiring: `heads of sales and talent at ${companyName}`,
      product: `product and product marketing leaders at ${companyName}`,
      pricing: `revenue and pricing leaders at ${companyName}`,
      leadership: `executives at ${companyName}`,
      news: `communications and partnerships leaders at ${companyName}`,
    };
    const data = await this.client.run<unknown>("vaaya", "onefind", {
      query: queryBySignal[signalType],
      limit: 5,
    });

    return extractRows<JsonRecord>(data, ["rows", "results", "people", "items"])
      .map((row) => ({
        name: asString(row.name) ?? "Unknown",
        title: asString(row.title) ?? "Unknown",
        profileUrl: asString(row.linkedin) ?? asString(row.linkedin_url),
      }))
      .filter((person) => person.name !== "Unknown");
  }
}
