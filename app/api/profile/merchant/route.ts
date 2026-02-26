import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

/**
 * POST /api/profile/merchant — proxy to backend to add business to user profile.
 */
export async function POST(request: NextRequest) {
  const clientId = request.headers.get("x-client-id") ?? "";
  if (!clientId) {
    return NextResponse.json(
      { message: "Client ID required" },
      { status: 400 }
    );
  }
  let body: { businessName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON" },
      { status: 400 }
    );
  }
  const businessName = body?.businessName?.trim();
  if (!businessName) {
    return NextResponse.json(
      { message: "Business name required" },
      { status: 400 }
    );
  }
  const url = new URL(request.url);
  const apiUrl = new URL(API_BASE);
  if (url.origin === apiUrl.origin) {
    return NextResponse.json(
      { message: "Run the API server (backend) and set NEXT_PUBLIC_BASE_URL to add businesses." },
      { status: 503 }
    );
  }
  try {
    const res = await fetch(`${API_BASE}/profile/merchant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": clientId,
      },
      body: JSON.stringify({ businessName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        data ?? { message: "Failed to add business" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { message: "Request failed" },
      { status: 502 }
    );
  }
}
