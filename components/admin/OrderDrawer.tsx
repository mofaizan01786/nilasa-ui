"use client";

import { useState } from "react";
import { Order, OrderItem } from "@/lib/types";
import { AdminDrawer } from "./AdminDrawer";
import { formatPrice } from "@/lib/catalog";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { refundPaymentAdmin } from "@/lib/dotnet-backend";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import {
  ShoppingBag,
  CreditCard,
  MapPin,
  Calendar,
  RotateCcw,
  AlertCircle
} from "lucide-react";

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onRefunded?: () => void;
  onUpdated?: (msg?: string) => void;
}

export function OrderDrawer({ isOpen, onClose, order, onRefunded, onUpdated }: OrderDrawerProps) {
  const [confirmRefundOpen, setConfirmRefundOpen] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState("");

  if (!order) return null;

  const orderId = order.orderId || order.id || 0;
  const items = order.items || [];
  const placedDate = order.placedAt || order.createdAt || "";
  const payment = order.payment;
  const canRefund = payment && payment.status.toLowerCase() !== "refunded" && order.status.toLowerCase() !== "cancelled";

  const handleExecuteRefund = async () => {
    if (!payment) return;
    setRefundLoading(true);
    setRefundError("");

    try {
      const ok = await refundPaymentAdmin(payment.paymentId);
      if (ok) {
        setConfirmRefundOpen(false);
        if (onRefunded) onRefunded();
        onClose();
      } else {
        setRefundError("Backend rejected the refund request. Please check payment status.");
      }
    } catch {
      setRefundError("Network error occurred while processing refund.");
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <>
      <AdminDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={`Order #${orderId}`}
        subtitle={placedDate ? `Placed on ${new Date(placedDate).toLocaleString("en-IN")}` : "Order Details"}
        width={600}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {refundError && (
            <div
              style={{
                backgroundColor: "#FDF0EE",
                color: "var(--status-danger)",
                border: "1px solid #F8C8C3",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <AlertCircle size={16} strokeWidth={2} />
              <span>{refundError}</span>
            </div>
          )}

          {/* Fulfillment Progress Status Banner */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 6,
              border: "1px solid var(--admin-slate-200)",
              backgroundColor: "var(--admin-surface)",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}
          >
            <span style={{ fontSize: "11px", color: "var(--admin-slate-600)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Fulfillment Stage
            </span>
            <OrderStatusBadge status={order.status} showStepper />
          </div>

          {/* Order Info Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div
              style={{
                padding: "12px 14px",
                border: "1px solid var(--admin-slate-200)",
                borderRadius: 6,
                background: "#FFFFFF"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <CreditCard size={14} color="var(--admin-accent)" />
                <span style={{ fontSize: "11px", color: "var(--admin-slate-600)", fontWeight: 600, textTransform: "uppercase" }}>
                  Payment
                </span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-ink)" }} className="admin-tabular">
                {formatPrice(order.totalAmount)}
              </div>
              <span style={{ fontSize: "12px", color: payment?.status.toLowerCase() === "refunded" ? "var(--status-danger)" : "var(--status-published)", fontWeight: 500 }}>
                {payment?.status ? `● ${payment.status}` : "Standard Payment"}
              </span>
            </div>

            <div
              style={{
                padding: "12px 14px",
                border: "1px solid var(--admin-slate-200)",
                borderRadius: 6,
                background: "#FFFFFF"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Calendar size={14} color="var(--admin-accent)" />
                <span style={{ fontSize: "11px", color: "var(--admin-slate-600)", fontWeight: 600, textTransform: "uppercase" }}>
                  Order Date
                </span>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-ink)" }}>
                {placedDate ? new Date(placedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </div>
              <span style={{ fontSize: "11px", color: "var(--admin-slate-600)" }}>
                Pan-India Express
              </span>
            </div>
          </div>

          {/* Customer Address Snapshot */}
          <div
            style={{
              padding: "12px 14px",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: 6,
              background: "#FFFFFF"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <MapPin size={14} color="var(--admin-accent)" />
              <span style={{ fontSize: "11px", color: "var(--admin-slate-600)", fontWeight: 600, textTransform: "uppercase" }}>
                Delivery Destination
              </span>
            </div>
            <div style={{ fontSize: "13px", color: "var(--admin-ink)", fontWeight: 500 }}>
              {order.shippingAddress ? (
                <span>
                  {order.shippingAddress.name} • {order.shippingAddress.phone}
                  <br />
                  <span style={{ color: "var(--admin-slate-600)", fontWeight: 400 }}>
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}
                  </span>
                </span>
              ) : (
                <span style={{ color: "var(--admin-slate-600)" }}>Address ID #{order.addressId}</span>
              )}
            </div>
          </div>

          {/* Order Line Items Table */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ShoppingBag size={14} color="var(--admin-accent)" />
              <span style={{ fontSize: "12px", color: "var(--admin-slate-600)", fontWeight: 600, textTransform: "uppercase" }}>
                Items in Order ({items.length})
              </span>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU / Size</th>
                    <th style={{ textAlign: "right" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Price</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: OrderItem, idx) => (
                    <tr key={item.orderItemId || idx}>
                      <td>
                        <strong style={{ color: "var(--admin-ink)" }}>{item.productName}</strong>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
                        {item.size} • {item.color}
                      </td>
                      <td style={{ textAlign: "right" }} className="admin-tabular">
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: "right" }} className="admin-tabular">
                        {formatPrice(item.priceAtPurchase)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }} className="admin-tabular">
                        {formatPrice(item.priceAtPurchase * item.quantity)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} style={{ textAlign: "right", fontWeight: 600, background: "#F7F8FA" }}>
                      Grand Total
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--admin-ink)", background: "#F7F8FA" }} className="admin-tabular">
                      {formatPrice(order.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Fulfillment Status Controls */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 6,
              border: "1px solid var(--admin-slate-200)",
              backgroundColor: "var(--admin-surface)",
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}
          >
            <span style={{ fontSize: "11px", color: "var(--admin-slate-600)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Update Order Status
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((st) => {
                const isCurrent = order.status.toLowerCase() === st;
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={isCurrent}
                    onClick={async () => {
                      const ok = await import("@/lib/dotnet-backend").then((m) => m.updateOrderStatusAdmin(orderId, st as any));
                      if (ok) {
                        if (onRefunded) onRefunded();
                        onClose();
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      cursor: isCurrent ? "default" : "pointer",
                      border: isCurrent ? "1.5px solid var(--admin-accent)" : "1px solid var(--admin-slate-300)",
                      background: isCurrent ? "var(--admin-accent)" : "#FFFFFF",
                      color: isCurrent ? "#FFFFFF" : "var(--admin-slate-700)",
                      opacity: isCurrent ? 0.9 : 1
                    }}
                  >
                    {st === "confirmed" ? "✓ Confirmed" : st === "shipped" ? "🚚 Shipped" : st === "delivered" ? "📦 Delivered" : st === "cancelled" ? "✕ Cancelled" : "Pending"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            {canRefund ? (
              <button
                type="button"
                onClick={() => setConfirmRefundOpen(true)}
                className="admin-btn-destructive"
              >
                <RotateCcw size={13} />
                <span>Process Refund ({formatPrice(order.totalAmount)})</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={onClose}
              className="admin-btn-secondary"
            >
              Close receipt
            </button>
          </div>
        </div>
      </AdminDrawer>

      {/* Refund Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={confirmRefundOpen}
        onClose={() => setConfirmRefundOpen(false)}
        onConfirm={handleExecuteRefund}
        title="Authorize Order Refund"
        itemName={`Order #${orderId} for ${formatPrice(order.totalAmount)}`}
        loading={refundLoading}
      />
    </>
  );
}
