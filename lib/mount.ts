import { getBaseUrl } from "./config";

export type MountResult = {
  businessName: string;
};

/**
 * Mount a store from an external link (e.g. Instagram).
 * Backend/agent tools perform the mount; businessName enables the agent to know which store to use.
 * URL: baseURL/mount (POST with { link }) → { businessName }
 */
export async function mountFromLink(link: string): Promise<MountResult> {
  const base = getBaseUrl();
  const isSameOrigin =
    typeof window !== "undefined" && base === window.location.origin;
  const url = isSameOrigin ? `${base}/api/mount` : `${base}/mount`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mount failed: ${err || res.statusText}`);
  }

  const data = (await res.json()) as MountResult;
  if (!data.businessName) {
    throw new Error("Mount response missing businessName");
  }
  return data;
}
