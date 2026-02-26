import { getBaseUrl } from "./config";
import type { BrandInfo } from "./brand";
import { isDemoModeActive } from "@/contexts/demo-mode";

const DEMO_BRAND: BrandInfo = {
  welcomeMessage: "Welcome to Vant Demo Store",
  ethos: "Quality, simplicity, and a great shopping experience.",
  initialConciergeMessage:
    "Hi! I'm your personal shopping assistant. I'm here to help you find exactly what you're looking for — whether it's a gift, something for yourself, or inspiration. Tell me what you love or what occasion you're shopping for, and I'll suggest the best options for you.",
};

function isDemoBusiness(businessName: string): boolean {
  const normalized = businessName.trim().toLowerCase().replace(/\s+/g, "-");
  return normalized === "vant-demo-business";
}

/**
 * Fetch brand for a merchant (same as customer-facing brand; used in dashboard to edit).
 * In demo mode, for the demo business, returns the pre-set demo brand.
 */
export async function getBrandForMerchant(
  businessName: string
): Promise<BrandInfo | null> {
  if (typeof window !== "undefined" && isDemoModeActive() && isDemoBusiness(businessName)) {
    return DEMO_BRAND;
  }
  const base = getBaseUrl();
  const slug = encodeURIComponent(businessName);
  const isSameOrigin =
    typeof window !== "undefined" && base === window.location.origin;
  const url = isSameOrigin
    ? `/api/merchant/${slug}/brand`
    : `${base}/merchant/${slug}/brand`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as BrandInfo;
  return data && typeof data === "object" ? data : null;
}

/**
 * Update brand for a merchant (welcome message, ethos, initial concierge, etc.).
 */
export async function updateBrandForMerchant(
  businessName: string,
  brand: BrandInfo
): Promise<BrandInfo> {
  const base = getBaseUrl();
  const slug = encodeURIComponent(businessName);
  const isSameOrigin =
    typeof window !== "undefined" && base === window.location.origin;
  const url = isSameOrigin
    ? `/api/merchant/${slug}/brand`
    : `${base}/merchant/${slug}/brand`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(brand),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? "Failed to save brand"
    );
  }
  return res.json() as Promise<BrandInfo>;
}
