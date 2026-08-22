import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://nilasabackend.geecera.com/api/v1";

/**
 * Proxies GET /api/orders/[id] directly to .NET Backend API (GET /api/v1/orders/{id}).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${BACKEND_BASE}/orders/${id}`, {
      headers,
      cache: "no-store"
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Order not found" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/orders/[id] Error]", err);
    return NextResponse.json({ error: "Order service unavailable." }, { status: 500 });
  }
}
