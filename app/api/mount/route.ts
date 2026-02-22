import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/mount
 * Mount a store from an external link (e.g. Instagram).
 * In production, this delegates to your agent tools.
 * Request body: { link: string }
 * Response: { businessName: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { link?: string };
    const link = body?.link;

    if (!link || typeof link !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid link" },
        { status: 400 }
      );
    }

    // Placeholder: extract business name from URL host or path.
    // In production, agent tools parse the link and return businessName.
    let businessName: string;
    try {
      const url = new URL(link);
      const host = url.hostname.replace(/^www\./, "");
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (host.includes("instagram.com") && pathParts[0]) {
        businessName = pathParts[0].replace(/[^a-zA-Z0-9]/g, " ");
      } else {
        businessName = host.split(".")[0] ?? "store";
      }
      businessName =
        businessName.charAt(0).toUpperCase() + businessName.slice(1).toLowerCase();
    } catch {
      businessName = "Store";
    }

    return NextResponse.json({ businessName });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
