export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  researchProviderMode:
    process.env.RESEARCH_PROVIDER_MODE ?? (process.env.VAAYA_API_KEY ? "vaaya" : "demo"),
  vaayaApiKey: process.env.VAAYA_API_KEY,
  vaayaBaseUrl: process.env.VAAYA_BASE_URL ?? "https://vaaya.ai",
};

export function isVaayaMode() {
  return env.researchProviderMode === "vaaya";
}
