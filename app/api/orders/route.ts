import { NextRequest, NextResponse } from "next/server";
import { readOrders, createOrderRecord } from "@/lib/orders-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let orders = readOrders();
    if (status && status.toUpperCase() !== "ALL") {
      orders = orders.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json(orders);
  } catch (err) {
    console.error("[GET /api/orders Error]", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item." }, { status: 400 });
    }

    if (!body.shippingAddress || !body.shippingAddress.name || !body.shippingAddress.phone) {
      return NextResponse.json({ error: "Customer name and phone number are required." }, { status: 400 });
    }

    // Try forwarding to ASP.NET Core backend if user is authenticated
    const authHeader = req.headers.get("authorization");
    const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
    let backendOrderId: number | null = null;

    if (backendUrl && authHeader) {
      try {
        const backendPayload = {
          addressId: body.addressId || 1,
          items: body.items.map((i: { variantId?: number; productId: number; quantity: number }) => ({
            productVariantId: i.variantId || i.productId,
            quantity: i.quantity
          }))
        };

        const res = await fetch(`${backendUrl}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader
          },
          body: JSON.stringify(backendPayload)
        });

        if (res.ok) {
          const resData = await res.json();
          backendOrderId = typeof resData === "number" ? resData : resData.orderId;
        }
      } catch (err) {
        console.warn("[Orders API] Backend API forwarded attempt:", err);
      }
    }

    // Persist to the persistent store
    const createdOrder = createOrderRecord({
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod || "upi",
      paymentStatus: body.paymentStatus || (body.paymentMethod === "cod" ? "Pending" : "Success"),
      transactionId: body.transactionId,
      items: body.items,
      totalAmount: body.totalAmount,
      discountApplied: body.discountApplied,
      couponCode: body.couponCode,
      userId: body.userId
    });

    if (backendOrderId) {
      createdOrder.orderId = backendOrderId;
      createdOrder.id = backendOrderId;
      createdOrder.orderNumber = `NIL-${backendOrderId}`;
    }

    return NextResponse.json({
      success: true,
      order: createdOrder,
      orderId: createdOrder.orderId
    });
  } catch (err) {
    console.error("[POST /api/orders Error]", err);
    return NextResponse.json({ error: "Failed to process order." }, { status: 500 });
  }
}
