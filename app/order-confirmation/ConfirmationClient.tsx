"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/catalog";
import { CheckCircle2, Printer, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Package } from "lucide-react";

export function ConfirmationClient() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("order");
  const rawAmount = searchParams.get("amount");
  const customerName = searchParams.get("name") || "Valued Customer";
  const paymentMethod = searchParams.get("method") || "upi";

  // Format order number cleanly
  let formattedOrderId = "NIL-104825";
  if (rawOrderId && rawOrderId !== "0") {
    formattedOrderId = rawOrderId.startsWith("NIL-") ? rawOrderId : `NIL-${rawOrderId}`;
  }

  const totalPaid = rawAmount ? Number(rawAmount) : 4990;

  const orderDate = new Date();
  const startDay = new Date(orderDate);
  startDay.setDate(orderDate.getDate() + 3);
  const endDay = new Date(orderDate);
  endDay.setDate(orderDate.getDate() + 5);

  const deliveryStart = startDay.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric"
  });
  const deliveryEnd = endDay.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const getMethodLabel = (method: string) => {
    switch (method.toLowerCase()) {
      case "upi":
        return "Instant UPI / QR (Paid)";
      case "card":
        return "Credit / Debit Card (Paid)";
      case "netbanking":
        return "Net Banking (Paid)";
      case "cod":
        return "Cash on Delivery (Pay on Arrival)";
      case "razorpay":
        return "Razorpay Verified (Paid)";
      default:
        return "UPI Payment";
    }
  };

  return (
    <div className="confirmation-card" style={{ maxWidth: 760, margin: "40px auto", padding: "36px 32px" }}>
      <div className="confirmation-header" style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
            border: "2px solid #10B981",
            color: "#047857",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16
          }}
        >
          <CheckCircle2 size={36} strokeWidth={2.2} />
        </div>
        <span className="eyebrow eyebrow--gold" style={{ display: "block", marginBottom: 6 }}>
          ORDER CONFIRMED & DISPATCH PREPARED
        </span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", margin: "4px 0 10px", color: "#1A1D20" }}>
          Thank you for choosing Nilasa, {customerName}.
        </h1>
        <p className="confirmation-subtitle" style={{ color: "#64748B", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto" }}>
          Your order has been placed and forwarded to our master artisans for inspection, steam pressing, and luxury botanical gift packaging.
        </p>
      </div>

      {/* Order Status Details Box */}
      <div
        className="order-details-box"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
          background: "#FAF8F5",
          padding: "20px 24px",
          borderRadius: 14,
          border: "1px solid #ECE7F2",
          marginBottom: 24
        }}
      >
        <div className="order-detail-column">
          <span className="detail-label" style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            Order Reference
          </span>
          <strong className="detail-value order-id-value" style={{ display: "block", fontFamily: "var(--font-mono)", color: "#354232", fontSize: "1.1rem", marginTop: 4 }}>
            #{formattedOrderId}
          </strong>
        </div>

        <div className="order-detail-column">
          <span className="detail-label" style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            Total Amount
          </span>
          <strong className="detail-value price" style={{ display: "block", fontFamily: "var(--font-mono)", color: "#1A1D20", fontSize: "1.1rem", marginTop: 4 }}>
            {formatPrice(totalPaid)}
          </strong>
        </div>

        <div className="order-detail-column">
          <span className="detail-label" style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            Payment Method
          </span>
          <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#7C5999", marginTop: 4 }}>
            {getMethodLabel(paymentMethod)}
          </span>
        </div>

        <div className="order-detail-column">
          <span className="detail-label" style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            Estimated Delivery
          </span>
          <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1A1D20", marginTop: 4 }}>
            {deliveryStart} – {deliveryEnd}
          </span>
        </div>
      </div>

      {/* Track & Next Steps Banner */}
      <div
        className="confirmation-info-banner"
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #FAF8FD 0%, #F5EEFA 100%)",
          border: "1px solid #E4D9F0",
          padding: "16px 20px",
          borderRadius: 12,
          marginBottom: 28
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(142, 110, 168, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--nilasa-indigo)" }}>
          <Package size={20} />
        </div>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700, color: "#1A1D20" }}>
            Tracking Updates & Digital Invoice Sent
          </h3>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748B", lineHeight: 1.45 }}>
            A confirmation receipt with your digital invoice and air courier tracking link has been registered. You can also view this order under your Nilasa account anytime.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="confirmation-actions" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        <Link
          href="/shop"
          className="button button--gold"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px" }}
        >
          <ShoppingBag size={16} />
          <span>Continue Shopping Collections</span>
          <ArrowRight size={14} />
        </Link>
        <button
          type="button"
          className="button button--lavender-glass"
          onClick={() => window.print()}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px" }}
        >
          <Printer size={16} />
          <span>Print Order Receipt</span>
        </button>
      </div>
    </div>
  );
}
