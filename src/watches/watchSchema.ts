import { z } from "zod";
import { SIGNAL_TYPES } from "@/types/signals";

export const createWatchSchema = z.object({
  userId: z.string().trim().min(1).default("nehaprasad"),
  companyUrl: z.string().trim().min(1, "Company URL is required."),
  companyName: z.string().trim().optional(),
  watchFrequency: z.string().trim().min(1).default("6h"),
  signals: z
    .array(z.enum(SIGNAL_TYPES))
    .min(1, "Pick at least one signal to watch."),
});

export type CreateWatchInput = z.infer<typeof createWatchSchema>;
