/**
 * Products and services for a merchant business.
 * Stored in localStorage keyed by business slug until backend support exists.
 */

export type ProductOrServiceType = "product" | "service";

export type ProfileProductOrService = {
  id: string;
  name: string;
  description?: string;
  type: ProductOrServiceType;
  price?: string;
  imageUrl?: string; // URL or data URL for vibe scroll
  createdAt: string; // ISO
};

const STORAGE_PREFIX = "vant-profile-items-";

function storageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

export function getProfileProductsAndServices(
  businessSlug: string
): ProfileProductOrService[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(businessSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProfileProductOrService[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addProfileProductOrService(
  businessSlug: string,
  item: Omit<ProfileProductOrService, "id" | "createdAt">
): ProfileProductOrService {
  const list = getProfileProductsAndServices(businessSlug);
  const newItem: ProfileProductOrService = {
    ...item,
    id: crypto.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(newItem);
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey(businessSlug), JSON.stringify(list));
  }
  return newItem;
}

export function updateProfileProductOrService(
  businessSlug: string,
  id: string,
  updates: Partial<Omit<ProfileProductOrService, "id" | "createdAt">>
): ProfileProductOrService | null {
  const list = getProfileProductsAndServices(businessSlug);
  const index = list.findIndex((i) => i.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...updates };
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey(businessSlug), JSON.stringify(list));
  }
  return list[index];
}

export function removeProfileProductOrService(
  businessSlug: string,
  id: string
): boolean {
  const list = getProfileProductsAndServices(businessSlug).filter(
    (i) => i.id !== id
  );
  if (list.length === getProfileProductsAndServices(businessSlug).length)
    return false;
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey(businessSlug), JSON.stringify(list));
  }
  return true;
}
