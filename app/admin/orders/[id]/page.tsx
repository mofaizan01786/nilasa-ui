import { notFound } from "next/navigation";
import Link from "next/link";
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
  const order = await fetchOrderByIdAdmin(isNaN(numId) ? 101 : numId);

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
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.88rem" }}>
            <span style={{ color: "#64748B" }}>Fulfillment Status:</span>
            <span className={`admin-badge admin-badge--${order.status.toLowerCase()}`}>{order.status}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.88rem" }}>
            <span style={{ color: "#64748B" }}>Payment Method:</span>
            <strong style={{ textTransform: "uppercase" }}>
              {order.paymentMethod || order.payment?.status || "Online"}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.88rem" }}>
            <span style={{ color: "#64748B" }}>Order Date:</span>
            <span>{orderDate ? new Date(orderDate).toLocaleString("en-IN") : "—"}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="admin-card">
        <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "#0F172A", margin: "0 0 16px" }}>
          Purchased Items ({order.items.length})
        </h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Size</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => {
              const price = item.priceAtPurchase || item.unitPrice || 0;
              return (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: "#0F172A" }}>{item.productName || `Variant #${item.productVariantId}`}</strong>
                    {item.sku && <span style={{ display: "block", fontSize: "0.7rem", color: "#64748B" }}>SKU: {item.sku}</span>}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{item.size || "Free"}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{formatPrice(price)}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>x{item.quantity}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {formatPrice(price * item.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ borderTop: "2px solid #0F172A", marginTop: 20, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0F172A" }}>Grand Total Amount</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 700, color: "#B8912E" }}>
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
