import { NextRequest, NextResponse } from "next/server";
import { readOrders, updateOrderStatusInStore } from "@/lib/orders-store";
import { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    const orders = readOrders();
    const order = orders.find((o) => (o.orderId || o.id) === orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("[GET /api/orders/[id] Error]", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json({ error: "New status is required" }, { status: 400 });
    }

    const updated = updateOrderStatusInStore(orderId, body.status as OrderStatus);
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error("[PATCH /api/orders/[id] Error]", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
