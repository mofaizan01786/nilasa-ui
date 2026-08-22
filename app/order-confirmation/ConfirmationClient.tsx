"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { formatPrice } from "@/lib/catalog";
import { fetchOrderByIdAuthoritative } from "@/lib/api";
import { AuthoritativeOrderDetailsDto } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Package,
  Clock,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Loader2
} from "lucide-react";

export function ConfirmationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const rawOrderId = searchParams.get("order");
  const parsedOrderId = rawOrderId ? parseInt(rawOrderId.replace(/\D/g, ""), 10) : null;

  const [order, setOrder] = useState<AuthoritativeOrderDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuthoritativeOrder = useCallback(
    async (isManualRefresh = false) => {
      if (!parsedOrderId) {
        setLoading(false);
        return;
      }

      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const activeToken =
        token ||
        (typeof window !== "undefined"
          ? window.localStorage.getItem("nilasa-auth-token")
          : null);

      try {
        const orderData = await fetchOrderByIdAuthoritative(
          parsedOrderId,
          activeToken || undefined
        );
        if (orderData) {
          setOrder(orderData);
          setError(null);
        } else {
          setError("Unable to retrieve order records from backend.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect to order confirmation service.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [parsedOrderId, token]
  );

  useEffect(() => {
    loadAuthoritativeOrder();
  }, [loadAuthoritativeOrder]);

  const formattedOrderId = order
    ? `NIL-${order.orderId}`
    : rawOrderId
    ? `NIL-${rawOrderId.replace(/\D/g, "")}`
    : "NIL-104825";

  const totalPaid = order ? Number(order.totalAmount) : 0;
  const isConfirmed =
    order?.status?.toLowerCase() === "confirmed" ||
    order?.status?.toLowerCase() === "delivered" ||
    order?.status?.toLowerCase() === "shipped" ||
    order?.payment?.status === "Success";
  const isPending =
    order?.status?.toLowerCase() === "pending" &&
    order?.payment?.status !== "Success";
  const isFailed =
    order?.status?.toLowerCase() === "cancelled" ||
    order?.payment?.status === "Failed";

  const orderDate = order?.placedAt ? new Date(order.placedAt) : new Date();
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

  const customerName = user?.name || "Valued Customer";

  // Loading skeleton
  if (loading) {
    return (
      <div
        className="confirmation-card"
        style={{
          maxWidth: 680,
          margin: "60px auto",
          padding: "48px 32px",
          textAlign: "center"
        }}
      >
        <Loader2
          size={36}
          className="animate-spin"
          color="var(--nilasa-indigo)"
          style={{ margin: "0 auto 16px" }}
        />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
          Retrieving Authoritative Order Details...
        </h2>
        <p style={{ color: "#64748B", fontSize: "0.88rem" }}>
          Connecting to Nilasa secure verification service
        </p>
      </div>
    );
  }

  // Failed / Cancelled View
  if (isFailed) {
    return (
      <div
        className="confirmation-card"
        style={{
          maxWidth: 720,
          margin: "40px auto",
          padding: "36px 32px",
          textAlign: "center"
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#FEF2F2",
            border: "2px solid #EF4444",
            color: "#DC2626",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16
          }}
        >
          <XCircle size={36} strokeWidth={2} />
        </div>
        <span className="eyebrow" style={{ color: "#DC2626", display: "block", marginBottom: 6 }}>
          PAYMENT NOT COMPLETED
        </span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", margin: "4px 0 10px", color: "#1A1D20" }}>
          Order Payment Failed
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto 28px" }}>
          The payment transaction for Order #{formattedOrderId} was cancelled or declined by your bank. Your shopping bag has been preserved.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/checkout" className="button button--gold">
            <span>Retry Checkout</span>
            <ArrowRight size={14} />
          </Link>
          <Link href="/shop" className="button button--lavender-glass">
            <span>Return to Collections</span>
          </Link>
        </div>
      </div>
    );
  }

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
            <p><strong>Status:</strong> <span className="print-badge-paid">{isConfirmed ? "CONFIRMED & PAID" : "PENDING"}</span></p>
          </div>
        </div>
        <div className="print-divider" />
      </div>

      {/* ── SCREEN-ONLY CELEBRATION / STATUS HEADER ── */}
      <div className="confirmation-header no-print" style={{ textAlign: "center", marginBottom: 28 }}>
        {isConfirmed ? (
          <>
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
              Your order has been verified on our secure servers and forwarded to our master artisans for inspection, steam pressing, and luxury botanical gift packaging.
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#FEF3C7",
                border: "2px solid #F59E0B",
                color: "#D97706",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16
              }}
            >
              <Clock size={36} strokeWidth={2.2} />
            </div>
            <span className="eyebrow" style={{ color: "#D97706", display: "block", marginBottom: 6 }}>
              PAYMENT VERIFICATION PENDING
            </span>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", margin: "4px 0 10px", color: "#1A1D20" }}>
              Order #{formattedOrderId} Received
            </h1>
            <p className="confirmation-subtitle" style={{ color: "#64748B", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto" }}>
              We are awaiting final bank clearance. If you completed payment via UPI or Net Banking, confirmation will update automatically.
            </p>
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="button button--lavender-glass"
                disabled={refreshing}
                onClick={() => loadAuthoritativeOrder(true)}
                style={{ fontSize: "0.82rem", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                <span>{refreshing ? "Checking Status..." : "Check Live Status"}</span>
              </button>
            </div>
          </>
        )}
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
          <p className="print-meta-text"><strong>Status:</strong> {order?.status || "Pending"}</p>
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
          <strong className="detail-value price">{formatPrice(totalPaid || 4990)}</strong>
        </div>

        <div className="order-detail-column">
          <span className="detail-label">Order Status</span>
          <span className="detail-value-sub" style={{ textTransform: "capitalize", fontWeight: 700, color: isConfirmed ? "#047857" : "#D97706" }}>
            {order?.status || "Confirmed"}
          </span>
        </div>

        <div className="order-detail-column">
          <span className="detail-label">Estimated Delivery</span>
          <span className="detail-value-sub">{deliveryStart} – {deliveryEnd}</span>
        </div>
      </div>

      {/* ── ORDER ITEMS BREAKDOWN TABLE (AUTHORITATIVE BACKEND DATA) ── */}
      {order && order.items && order.items.length > 0 && (
        <div style={{ margin: "20px 0 28px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1D20", marginBottom: 12 }}>
            Ordered Items ({order.items.length})
          </h3>
          <table className="admin-table" style={{ background: "#FFFFFF", borderRadius: 8, border: "1px solid #ECE7F2" }}>
            <thead>
              <tr style={{ background: "#FAF8F5" }}>
                <th style={{ padding: "10px 14px", fontSize: "0.78rem", textAlign: "left" }}>Garment Piece</th>
                <th style={{ padding: "10px 14px", fontSize: "0.78rem", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "10px 14px", fontSize: "0.78rem", textAlign: "right" }}>Price</th>
                <th style={{ padding: "10px 14px", fontSize: "0.78rem", textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #F1EFEA" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <strong style={{ display: "block", color: "#1A1D20", fontSize: "0.88rem" }}>
                      {item.productName}
                    </strong>
                    <span style={{ fontSize: "0.76rem", color: "#64748B" }}>
                      {item.size ? `Size: ${item.size}` : ""} {item.sku ? `• SKU: ${item.sku}` : ""}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "0.85rem" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontSize: "0.85rem" }}>
                    {formatPrice(item.priceAtPurchase)}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontSize: "0.88rem", fontWeight: 700 }}>
                    {formatPrice(item.priceAtPurchase * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SCREEN-ONLY TRACK & NEXT STEPS BANNER ── */}
      <div className="confirmation-info-banner no-print">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(142, 110, 168, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "var(--nilasa-indigo)"
          }}
        >
          <Package size={20} />
        </div>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700, color: "#1A1D20" }}>
            Tracking Updates & Digital Invoice Registered
          </h3>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748B", lineHeight: 1.45 }}>
            A confirmation receipt with your digital invoice and air courier tracking link has been saved to your Nilasa account.
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
          This is a computer-generated digital order receipt verified by Nilasa backend service.
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
