import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/mount/:businessName/brand
 * Returns brand info for the business when frontend is same-origin.
 * In production with a separate API, the frontend uses NEXT_PUBLIC_BASE_URL and calls the backend directly.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ businessName: string }> }
) {
  const { businessName } = await params;
  if (!businessName) {
    return NextResponse.json({ error: "Missing businessName" }, { status: 400 });
  }
  // Same-origin: no backend; return empty so UI shows default. Proxy to backend here if BACKEND_URL is set.
  return NextResponse.json({});
}
