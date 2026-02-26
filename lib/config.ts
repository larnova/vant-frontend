/**
 * Base URL for the mount API.
 * Mount flow: baseURL/mount/{slug} — slug is always hyphenated (e.g. Vant-demo-business), no encoded spaces.
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

/**
 * Convert a business name to the canonical mount slug: hyphenated, first word capitalized (e.g. "Vant-demo-store").
 */
export function toMountSlug(businessName: string): string {
  const parts = businessName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""));
  if (parts.length === 0) return "business";
  const first = parts[0];
  const capitalized = first.charAt(0).toUpperCase() + first.slice(1);
  const rest = parts.slice(1);
  return [capitalized, ...rest].join("-");
}

/** Mount URL for a business — always uses slug format (e.g. /mount/Vant-demo-store), never encoded spaces. */
export function getMountUrl(businessName: string): string {
  const base = getBaseUrl();
  const slug = toMountSlug(businessName);
  return `${base}/mount/${encodeURIComponent(slug)}`;
}

/** Mount path only (for client-side navigation), e.g. /mount/Vant-demo-business */
export function getMountPath(businessName: string): string {
  const slug = toMountSlug(businessName);
  return `/mount/${encodeURIComponent(slug)}`;
}
