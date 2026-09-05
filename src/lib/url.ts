export function normalizeCompanyUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withProtocol);

  return {
    url: `${url.protocol}//${url.hostname}${url.pathname === "/" ? "" : url.pathname}`,
    domain: url.hostname.replace(/^www\./, "").toLowerCase(),
  };
}

export function companyNameFromDomain(domain: string) {
  const base = domain.split(".")[0] ?? domain;

  return base.charAt(0).toUpperCase() + base.slice(1);
}
