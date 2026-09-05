import { env } from "@/lib/env";

interface VaayaSuccessEnvelope<TData> {
  ok: true;
  data: TData;
  charged_cents: number;
  balance_remaining_cents?: number;
  transaction_id?: string;
}

interface VaayaErrorEnvelope {
  ok?: false;
  error?: string;
  message?: string;
  data?: {
    success?: boolean;
    error?: string;
    message?: string;
  };
}

function extractErrorMessage(
  payload: VaayaErrorEnvelope | null,
  status: number,
): string {
  if (!payload) {
    return `Vaaya request failed: ${status}`;
  }

  const nested = payload.data?.error ?? payload.data?.message;
  if (typeof nested === "string" && nested.trim()) {
    try {
      const parsed = JSON.parse(nested) as Array<{ message?: string; path?: string[] }>;
      if (Array.isArray(parsed) && parsed[0]?.message) {
        const path = parsed[0].path?.join(".") ?? "params";
        return `Vaaya validation error on ${path}: ${parsed[0].message}`;
      }
    } catch {
      return nested.slice(0, 280);
    }
  }

  if (payload.error) {
    return payload.error;
  }

  if (payload.message) {
    return payload.message;
  }

  return `Vaaya request failed: ${status}`;
}

export class VaayaClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    if (!env.vaayaApiKey) {
      throw new Error(
        "VAAYA_API_KEY is required when RESEARCH_PROVIDER_MODE=vaaya. Create a key at https://vaaya.ai/api-keys and add it to your server environment.",
      );
    }

    this.apiKey = env.vaayaApiKey;
    this.baseUrl = env.vaayaBaseUrl.replace(/\/$/, "");
  }

  async run<TData>(
    service: string,
    action: string,
    params: Record<string, unknown>,
  ): Promise<TData> {
    const response = await fetch(`${this.baseUrl}/api/run/${service}/${action}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | VaayaSuccessEnvelope<TData>
      | VaayaErrorEnvelope
      | null;

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload as VaayaErrorEnvelope | null, response.status));
    }

    if (!payload || !("ok" in payload) || !payload.ok) {
      throw new Error(
        extractErrorMessage(payload as VaayaErrorEnvelope | null, response.status),
      );
    }

    return payload.data;
  }
}
