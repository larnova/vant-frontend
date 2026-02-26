import { getBaseUrl } from "./config";
import { isDemoModeActive } from "@/contexts/demo-mode";

/**
 * Brand info for a merchant business (welcome message, ethos, AI concierge).
 */
export type BrandInfo = {
  welcomeMessage?: string;
  ethos?: string;
  brandMessages?: string[];
  initialConciergeMessage?: string;
};

const DEMO_BRAND: BrandInfo = {
  welcomeMessage: "Welcome to Vant Demo Business",
  ethos: "Quality, simplicity, and a great shopping experience.",
  initialConciergeMessage:
    "Hi! I'm your personal shopping assistant. I'm here to help you find exactly what you're looking for — whether it's a gift, something for yourself, or inspiration. Tell me what you love or what occasion you're shopping for, and I'll suggest the best options for you.",
};

/**
 * Fetch brand info for a business from the API.
 * In demo mode, for the demo business, returns a pre-set brand for the prototype.
 */
export async function getBrandFromApi(
  businessName: string
): Promise<BrandInfo | null> {
  const normalized = businessName.trim().toLowerCase().replace(/\s+/g, "-");
  const demoSlug = "vant-demo-business";
  if (typeof window !== "undefined" && isDemoModeActive() && normalized === demoSlug) {
    return DEMO_BRAND;
  }
  const base = getBaseUrl();
  const slug = encodeURIComponent(businessName);
  const isSameOrigin =
    typeof window !== "undefined" && base === window.location.origin;
  const url = isSameOrigin
    ? `/api/mount/${slug}/brand`
    : `${base}/mount/${slug}/brand`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as BrandInfo;
  return data && typeof data === "object" ? data : null;
}
