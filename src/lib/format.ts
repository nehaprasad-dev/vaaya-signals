const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
};

export function plainText(input?: string | null) {
  if (!input) {
    return "";
  }

  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
      if (entity.startsWith("#")) {
        const code =
          entity[1] === "x" || entity[1] === "X"
            ? Number.parseInt(entity.slice(2), 16)
            : Number.parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : "";
      }

      return HTML_ENTITIES[entity.toLowerCase()] ?? "";
    })
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function tidyCopy(input?: string | null, maxChars = 240) {
  const clean = plainText(input)
    .replace(/\b(watch video|learn how|view announcement|read more|sign up|get started|log in)\b/gi, " ")
    .replace(/\s*[·•|]\s*/g, ". ")
    .replace(/(\s*\.){2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    return "";
  }

  if (clean.length <= maxChars) {
    return clean;
  }

  const cut = clean.slice(0, maxChars);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return `${cut.slice(0, lastStop > 90 ? lastStop : maxChars).trim()}…`;
}

export function displayCompanyName(name: string) {
  if (!name) {
    return "Company";
  }

  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatRelativeTime(input?: string | null) {
  if (!input) {
    return "Never";
  }

  const date = new Date(input);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatSnapshotDate(input: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}
