"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/catalog";

export function ConfirmationClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || "NIL-984210";
  const rawAmount = searchParams.get("amount");
  const customerName = searchParams.get("name") || "Valued Customer";

  const totalPaid = rawAmount ? parseFloat(rawAmount) : 5990;

  // Calculate estimated delivery date (3-5 business days from now)
  const today = new Date();
  const deliveryStart = new Date(today.setDate(today.getDate() + 3)).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric"
  });
  const deliveryEnd = new Date(today.setDate(today.getDate() + 2)).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="confirmation-card">
      <div className="confirmation-header">
        <div className="confirmation-icon-ring">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="eyebrow eyebrow--gold">ORDER CONFIRMED</span>
        <h1>Thank you for choosing Nilasa, {customerName}.</h1>
        <p className="confirmation-subtitle">
          We’re carefully hand-inspecting and preparing your pieces with grace in every thread.
        </p>
      </div>

      {/* Order Status Details Box */}
      <div className="order-details-box">
        <div className="order-detail-column">
          <span className="detail-label">Order Reference Number</span>
          <span className="detail-value order-id-value">{orderId}</span>
        </div>

        <div className="order-detail-column">
          <span className="detail-label">Total Amount Paid</span>
          <span className="detail-value price">{formatPrice(totalPaid)}</span>
        </div>

        <div className="order-detail-column">
          <span className="detail-label">Estimated Delivery</span>
          <span className="detail-value">{deliveryStart} – {deliveryEnd}</span>
        </div>

        <div className="order-detail-column">
          <span className="detail-label">Shipping Method</span>
          <span className="detail-value">Complimentary Express Air</span>
        </div>
      </div>

      {/* Track & Next Steps */}
      <div className="confirmation-info-banner">
        <div className="info-banner-icon">📩</div>
        <div>
          <h3>Tracking Information & Invoice Sent</h3>
          <p>
            An order confirmation email with your digital invoice and real-time tracking link has been dispatched.
          </p>
        </div>
      </div>

      <div className="confirmation-actions">
        <Link href="/shop" className="button button--gold">
          Continue Shopping Collections →
        </Link>
        <button
          type="button"
          className="button button--lavender-glass"
          onClick={() => window.print()}
        >
          🖨️ Print Order Receipt
        </button>
      </div>
    </div>
  );
}
