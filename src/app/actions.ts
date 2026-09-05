"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createWatch } from "@/watches/createWatch";
import { deleteWatch } from "@/watches/deleteWatch";
import { runWatch } from "@/watches/runWatch";
import { SIGNAL_TYPES } from "@/types/signals";

export async function createWatchAction(formData: FormData) {
  const signals = SIGNAL_TYPES.filter((signal) => formData.get(signal) === "on");

  const result = await createWatch({
    userId: "nehaprasad",
    companyUrl: String(formData.get("companyUrl") ?? ""),
    companyName: String(formData.get("companyName") ?? "").trim() || undefined,
    watchFrequency: String(formData.get("watchFrequency") ?? "6h"),
    signals,
  });

  revalidatePath("/watches");
  redirect(`/watches/${result.watch.id}`);
}

export async function deleteWatchAction(formData: FormData) {
  const watchId = String(formData.get("watchId") ?? "");

  await deleteWatch(watchId);
  revalidatePath("/watches");
  redirect("/watches");
}

export async function runWatchAction(formData: FormData) {
  const watchId = String(formData.get("watchId") ?? "");

  await runWatch(watchId);
  revalidatePath("/watches");
  revalidatePath(`/watches/${watchId}`);
}
