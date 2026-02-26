import { getBaseUrl } from "./config";

export type ProductHandle = {
  id: string;
  handle: string;
  business: string;
  thumbnail?: string;
};

/**
 * Fetch products for the given business names from the backend.
 * When NEXT_PUBLIC_BASE_URL points to the API server, use GET {base}/mount/products?stores=...
 */
export async function fetchProductsFromApi(
  businessNames: string[]
): Promise<ProductHandle[]> {
  if (businessNames.length === 0) return [];
  const base = getBaseUrl();
  const isSameOrigin =
    typeof window !== "undefined" && base === window.location.origin;
  if (isSameOrigin) return []; // Next.js has no products API; caller should use mock
  const url = `${base}/mount/products?stores=${encodeURIComponent(businessNames.join(","))}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as (ProductHandle & { store?: string })[];
  // Normalize: backend may still return "store"; map to "business"
  return Array.isArray(data)
    ? data.map((item) => ({
        id: item.id,
        handle: item.handle,
        business: item.business ?? item.store ?? "",
        thumbnail: item.thumbnail,
      }))
    : [];
}
