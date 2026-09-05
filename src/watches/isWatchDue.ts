function frequencyToMs(frequency: string) {
  const normalized = frequency.trim().toLowerCase();

  if (normalized.endsWith("h")) {
    return Number.parseInt(normalized, 10) * 60 * 60 * 1000;
  }

  if (normalized.endsWith("d")) {
    return Number.parseInt(normalized, 10) * 24 * 60 * 60 * 1000;
  }

  return 6 * 60 * 60 * 1000;
}

export function isWatchDue(lastCheckedAt: Date | null, frequency: string, now = new Date()) {
  if (!lastCheckedAt) {
    return true;
  }

  return now.getTime() - lastCheckedAt.getTime() >= frequencyToMs(frequency);
}
