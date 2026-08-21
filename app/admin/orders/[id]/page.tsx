import { notFound } from "next/navigation";
import Link from "next/link";
import { readOrders } from "@/lib/orders-store";
import { fetchOrderByIdAdmin } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";

export const dynamic = "force-dynamic"; // SSR page for real-time order data

export default async function AdminOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  // Check local orders first
  const localOrders = readOrders();
  let order = localOrders.find((o) => (o.orderId || o.id) === numId) || null;

  // Fallback to backend API
  if (!order) {
    order = await fetchOrderByIdAdmin(isNaN(numId) ? 101 : numId);
  }

  if (!order) notFound();

  const address = order.shippingAddress;
  const orderDate = order.placedAt || order.createdAt;

  return (
    <div style={{ maxWidth: 840 }}>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow eyebrow--gold">ORDER RECEIPT DETAIL</span>
          <h1 className="admin-page-title">Order #{order.orderId || order.id}</h1>
        </div>
        <Link href="/admin/orders" className="button" style={{ background: "#E2E8F0", color: "#475569", minHeight: 40, fontSize: "0.75rem" }}>
          ← Back to Orders
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Customer & Address Details */}
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.88rem", textTransform: "uppercase", color: "#64748B", margin: "0 0 12px" }}>
            Customer Delivery Address
          </h3>
          {address ? (
            <>
              <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#0F172A" }}>{address.name}</p>
              <p style={{ margin: "0 0 4px", color: "#475569", fontSize: "0.88rem" }}>{address.address}</p>
              <p style={{ margin: "0 0 4px", color: "#475569", fontSize: "0.88rem" }}>
                {address.city}, {address.state} - {address.postalCode}
              </p>
              <p style={{ margin: "8px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#2563EB" }}>
                📞 {address.phone} • ✉️ {address.email}
              </p>
            </>
          ) : (
            <p style={{ color: "#64748B", fontSize: "0.88rem" }}>Address ID #{order.addressId} (User ID #{order.userId})</p>
          )}
        </div>

        {/* Payment & Status Summary */}
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.88rem", textTransform: "uppercase", color: "#64748B", margin: "0 0 12px" }}>
            Payment & Status Overview
          </h3>
          <p style={{ margin: "0 0 4px", color: "#475569", fontSize: "0.88rem" }}>
            <strong>Status:</strong> <span style={{ textTransform: "capitalize", fontWeight: 700, color: order.status === "confirmed" ? "#047857" : "#B45309" }}>{order.status}</span>
          </p>
          <p style={{ margin: "0 0 4px", color: "#475569", fontSize: "0.88rem" }}>
            <strong>Method:</strong> <span style={{ textTransform: "uppercase" }}>{order.paymentMethod || "UPI"}</span> ({order.paymentStatus || "Success"})
          </p>
          <p style={{ margin: "0 0 4px", color: "#475569", fontSize: "0.88rem" }}>
            <strong>Total Paid:</strong> <strong style={{ color: "#0F172A" }}>{formatPrice(order.totalAmount)}</strong>
          </p>
          <p style={{ margin: "8px 0 0", color: "#94A3B8", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
            Ordered on: {orderDate ? new Date(orderDate).toLocaleString("en-IN") : "Recent"}
          </p>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="admin-card">
        <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.88rem", textTransform: "uppercase", color: "#64748B", margin: "0 0 16px" }}>
          Ordered Items ({order.items?.length || 0})
        </h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Variant / SKU</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{item.productName || `Product #${item.productId}`}</strong>
                  {item.size && <span style={{ display: "block", fontSize: "0.75rem", color: "#64748B" }}>Size: {item.size}</span>}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#64748B" }}>
                  {item.sku || `VAR-${item.productVariantId || item.productId}`}
                </td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.unitPrice || item.priceAtPurchase || 0)}</td>
                <td><strong>{formatPrice((item.unitPrice || item.priceAtPurchase || 0) * item.quantity)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
