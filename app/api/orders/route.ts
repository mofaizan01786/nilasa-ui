import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://nilasabackend.geecera.com/api/v1";

/**
 * Proxies GET /api/orders directly to .NET Backend API (GET /api/v1/orders).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${BACKEND_BASE}/orders?${searchParams.toString()}`, {
      headers,
      cache: "no-store"
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch orders from server." }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/orders Error]", err);
    return NextResponse.json({ error: "Order service unavailable." }, { status: 500 });
  }
}

/**
 * Proxies POST /api/orders directly to .NET Backend API (POST /api/v1/orders).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authHeader) headers["Authorization"] = authHeader;

    const backendPayload = {
      addressId: body.addressId || 1,
      items: (body.items || []).map((i: { variantId?: number; productVariantId?: number; productId?: number; quantity: number }) => ({
        productVariantId: i.productVariantId || i.variantId || i.productId || 1,
        quantity: i.quantity || 1
      }))
    };

    const res = await fetch(`${BACKEND_BASE}/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(backendPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText || "Failed to create order on server." }, { status: res.status });
    }

    const data = await res.json();
    const orderId = typeof data === "number" ? data : (data.orderId || data.id);
    return NextResponse.json({ success: true, orderId });
  } catch (err: any) {
    console.error("[POST /api/orders Error]", err);
    return NextResponse.json({ error: "Order service unavailable." }, { status: 500 });
  }
}
