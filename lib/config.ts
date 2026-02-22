/**
 * Base URL for the mount API.
 * Mount flow: baseURL/mount/{businessName} — agent uses businessName to know which store to query.
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

/** Mount endpoint for a specific business. */
export function getMountUrl(businessName: string): string {
  const base = getBaseUrl();
  const slug = encodeURIComponent(businessName);
  return `${base}/mount/${slug}`;
}
