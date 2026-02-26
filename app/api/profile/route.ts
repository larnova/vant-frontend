import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

/**
 * GET /api/profile — proxy to backend when API_BASE is different; otherwise return empty profile.
 */
export async function GET(request: NextRequest) {
  const clientId = request.headers.get("x-client-id") ?? "";
  const empty = { clientId: clientId || "", displayName: undefined, email: undefined, businesses: [] };
  try {
    const url = new URL(request.url);
    const apiUrl = new URL(API_BASE);
    if (url.origin === apiUrl.origin) return NextResponse.json(empty);
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { "X-Client-Id": clientId },
    });
    if (!res.ok) return NextResponse.json(empty);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(empty);
  }
}
