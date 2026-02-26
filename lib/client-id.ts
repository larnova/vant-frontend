const STORAGE_KEY = "vant-client-id";

/**
 * Get or create a stable client ID for this browser (used for profile/merchant without full auth).
 */
export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
