import { env } from "@/lib/env";
import { DemoResearchProvider } from "@/providers/demo/demoResearchProvider";
import type { ResearchProvider } from "@/providers/types";
import { VaayaResearchProvider } from "@/providers/vaaya/vaayaResearchProvider";

export function createResearchProvider(): ResearchProvider {
  if (env.researchProviderMode === "vaaya") {
    return new VaayaResearchProvider();
  }

  return new DemoResearchProvider();
}
