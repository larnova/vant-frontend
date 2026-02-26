import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

/**
 * GET /api/merchant/:businessName/brand — proxy to backend or return empty.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ businessName: string }> }
) {
  const { businessName } = await params;
  if (!businessName) {
    return NextResponse.json({ error: "Missing businessName" }, { status: 400 });
  }
  const decoded = decodeURIComponent(businessName);
  try {
    const url = new URL(_request.url);
    const apiUrl = new URL(API_BASE);
    if (url.origin === apiUrl.origin) return NextResponse.json({});
    const res = await fetch(`${API_BASE}/merchant/${encodeURIComponent(decoded)}/brand`);
    if (!res.ok) return NextResponse.json({});
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({});
  }
}

/**
 * PUT /api/merchant/:businessName/brand — proxy to backend.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessName: string }> }
) {
  const { businessName } = await params;
  if (!businessName) {
    return NextResponse.json({ error: "Missing businessName" }, { status: 400 });
  }
  const decoded = decodeURIComponent(businessName);
  const url = new URL(request.url);
  const apiUrl = new URL(API_BASE);
  if (url.origin === apiUrl.origin) {
    return NextResponse.json(
      { message: "Run the API server and set NEXT_PUBLIC_BASE_URL to save brand." },
      { status: 503 }
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  try {
    const res = await fetch(`${API_BASE}/merchant/${encodeURIComponent(decoded)}/brand`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data ?? { message: "Failed to save brand" }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Request failed" }, { status: 502 });
  }
}
