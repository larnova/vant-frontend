import { getBaseUrl } from "./config";
import { getClientId } from "./client-id";
import {
  isDemoModeActive,
  DEMO_BUSINESS_SLUG,
  DEMO_BUSINESS_NAME,
} from "@/contexts/demo-mode";

export type ProfileBusiness = {
  businessName: string;
  slug: string;
};

export type UserProfile = {
  clientId: string;
  displayName?: string;
  email?: string;
  businesses: ProfileBusiness[];
};

const DEMO_PROFILE: UserProfile = {
  clientId: "demo",
  displayName: "Demo User",
  email: "demo@vant.app",
  businesses: [
    { businessName: DEMO_BUSINESS_NAME, slug: DEMO_BUSINESS_SLUG },
  ],
};

async function getHeaders(): Promise<HeadersInit> {
  const clientId = typeof window !== "undefined" ? getClientId() : "";
  return {
    "Content-Type": "application/json",
    "X-Client-Id": clientId,
  };
}

/**
 * Fetch current user profile (including businesses they're a merchant for).
 * In demo mode returns a mock profile with one business (Vant Demo Business).
 */
export async function fetchProfile(): Promise<UserProfile | null> {
  if (typeof window !== "undefined" && isDemoModeActive()) {
    return DEMO_PROFILE;
  }
  const base = getBaseUrl();
  const isSameOrigin =
    typeof window !== "undefined" && base === window.location.origin;
  const url = isSameOrigin ? "/api/profile" : `${base}/profile`;
  const res = await fetch(url, { headers: await getHeaders() });
  if (!res.ok) return null;
  const data = (await res.json()) as UserProfile | null;
  return data;
}

/**
 * Add a business to the current user's profile (become a merchant for that business).
 */
export async function addMerchantBusiness(
  businessName: string
): Promise<UserProfile> {
  const base = getBaseUrl();
  const isSameOrigin =
    typeof window !== "undefined" && base === window.location.origin;
  const url = isSameOrigin ? "/api/profile/merchant" : `${base}/profile/merchant`;
  const res = await fetch(url, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify({ businessName: businessName.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? "Failed to add business"
    );
  }
  return res.json() as Promise<UserProfile>;
}
