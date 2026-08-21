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
  const formattedOrderDate = orderDate.toLocaleDateString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

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
    <div className="confirmation-card print-receipt-wrapper">
      {/* ── PRINT-ONLY OFFICIAL INVOICE HEADER ── */}
      <div className="print-only-header">
        <div className="print-header-top">
          <div>
            <h1 className="print-brand-title">N I L A S A</h1>
            <p className="print-brand-tagline">Grace In Every Thread • Artisanal Luxury Womenswear</p>
          </div>
          <div className="print-invoice-meta">
            <h2 className="print-invoice-heading">TAX INVOICE / RECEIPT</h2>
            <p><strong>Order #:</strong> #{formattedOrderId}</p>
            <p><strong>Date:</strong> {formattedOrderDate}</p>
            <p><strong>Status:</strong> <span className="print-badge-paid">CONFIRMED & PAID</span></p>
          </div>
        </div>
        <div className="print-divider" />
      </div>

      {/* ── SCREEN-ONLY CELEBRATION HEADER ── */}
      <div className="confirmation-header no-print" style={{ textAlign: "center", marginBottom: 28 }}>
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

      {/* ── PRINT-ONLY CUSTOMER & BILLING INFO ── */}
      <div className="print-only-customer-grid">
        <div className="print-customer-col">
          <span className="print-section-label">CUSTOMER DETAILS</span>
          <p className="print-customer-name">{customerName}</p>
          <p className="print-meta-text">Pan-India Express Priority Delivery</p>
        </div>
        <div className="print-customer-col">
          <span className="print-section-label">PAYMENT & DISPATCH</span>
          <p className="print-meta-text"><strong>Method:</strong> {getMethodLabel(paymentMethod)}</p>
          <p className="print-meta-text"><strong>Est. Arrival:</strong> {deliveryStart} – {deliveryEnd}</p>
        </div>
      </div>

      {/* ── ORDER STATUS DETAILS BOX (SCREEN + PRINT) ── */}
      <div className="order-details-box">
        <div className="order-detail-column">
          <span className="detail-label">Order Reference</span>
          <strong className="detail-value order-id-value">#{formattedOrderId}</strong>
        </div>

        <div className="order-detail-column">
          <span className="detail-label">Total Amount</span>
          <strong className="detail-value price">{formatPrice(totalPaid)}</strong>
        </div>

        <div className="order-detail-column">
          <span className="detail-label">Payment Method</span>
          <span className="detail-value-sub">{getMethodLabel(paymentMethod)}</span>
        </div>

        <div className="order-detail-column">
          <span className="detail-label">Estimated Delivery</span>
          <span className="detail-value-sub">{deliveryStart} – {deliveryEnd}</span>
        </div>
      </div>

      {/* ── PRINT-ONLY ORDER BREAKDOWN TABLE ── */}
      <div className="print-only-breakdown">
        <table className="print-summary-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Handcrafted Artisanal Garment Order</strong>
                <br />
                <span style={{ fontSize: "0.8rem", color: "#666" }}>
                  Inspected Master Weave • Order #{formattedOrderId}
                </span>
              </td>
              <td style={{ textAlign: "center" }}>1 Package</td>
              <td style={{ textAlign: "right" }}>{formatPrice(totalPaid)}</td>
            </tr>
            <tr className="print-table-subrow">
              <td colSpan={2}>Pan-India Air Courier Delivery</td>
              <td style={{ textAlign: "right", color: "#047857" }}>FREE (Complimentary)</td>
            </tr>
            <tr className="print-table-subrow">
              <td colSpan={2}>Applicable Goods & Services Tax (GST)</td>
              <td style={{ textAlign: "right" }}>Included</td>
            </tr>
            <tr className="print-table-totalrow">
              <td colSpan={2}><strong>Grand Total Paid</strong></td>
              <td style={{ textAlign: "right" }}><strong>{formatPrice(totalPaid)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── SCREEN-ONLY TRACK & NEXT STEPS BANNER ── */}
      <div className="confirmation-info-banner no-print">
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

      {/* ── PRINT-ONLY FOOTER WITH OFFICIAL REGISTRATION ── */}
      <div className="print-only-footer">
        <div className="print-divider" />
        <div className="print-footer-grid">
          <div>
            <p className="print-footer-title">Nilasa Apparels</p>
            <p className="print-footer-text">Civil Lines, Kanpur, Uttar Pradesh - 208001, India</p>
            <p className="print-footer-text">Customer Care: nilasawear@gmail.com | +91 93361 14583</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="print-footer-title">Authenticity Guarantee</p>
            <p className="print-footer-text">100% Genuine Handcrafted Ethnic Wear</p>
            <p className="print-footer-text">7-Day Easy Exchange Policy</p>
          </div>
        </div>
        <p className="print-footer-bottom">
          This is a computer-generated digital order receipt. Thank you for shopping with Nilasa.
        </p>
      </div>

      {/* ── SCREEN-ONLY ACTION BUTTONS ── */}
      <div className="confirmation-actions no-print" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
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
