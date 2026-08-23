"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/catalog";
import { fetchOrdersAdmin } from "@/lib/dotnet-backend";
import { OrderDrawer } from "./OrderDrawer";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { AdminToast } from "./AdminToast";
import {
  ShoppingBag,
  Receipt,
  Search,
  RefreshCw,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Eye
} from "lucide-react";

interface AdminOrdersClientProps {
  orders: Order[];
  currentStatusFilter?: string;
}

export function AdminOrdersClient({
  orders: initialOrders,
  currentStatusFilter = ""
}: AdminOrdersClientProps) {
  const router = useRouter();

  const [orderList, setOrderList] = useState<Order[]>(initialOrders || []);
  const [loading, setLoading] = useState<boolean>(!initialOrders || initialOrders.length === 0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(currentStatusFilter || "ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOrdersData = useCallback(async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("nilasa-auth-token") || undefined
          : undefined;
      const list = await fetchOrdersAdmin(undefined, token);
      if (list && Array.isArray(list)) {
        setOrderList(list);
      }
    } catch (err) {
      console.error("Failed to load orders client-side:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrdersData();
  }, [loadOrdersData]);

  const handleReload = async (msg?: string) => {
    if (msg) setToastMessage(msg);
    await loadOrdersData();
    router.refresh();
  };

  const filteredOrders = useMemo(() => {
    let list = [...orderList];

    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter(
        (o) => String(o.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          String(o.orderId || o.id).includes(q) ||
          o.shippingAddress?.name?.toLowerCase().includes(q) ||
          o.shippingAddress?.phone?.includes(q) ||
          o.items?.some((item) => item.productName?.toLowerCase().includes(q))
      );
    }

    return list;
  }, [orderList, statusFilter, searchQuery]);

  return (
    <div>
      {toastMessage && (
        <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Orders ({filteredOrders.length})</h1>
          <p className="admin-page-subtitle">Track real-time fulfillment stages, payments, and shipments</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => loadOrdersData()}
            disabled={loading}
            className="admin-btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? "admin-spin" : ""} />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* Slim Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          {/* Search Box */}
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <Search
              size={14}
              color="var(--admin-slate-600)"
              style={{ position: "absolute", left: 10, pointerEvents: "none" }}
            />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
              style={{ width: 260 }}
            />
          </div>

          {/* Status Dropdown Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="ALL">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
          Showing {filteredOrders.length} of {orderList.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        {loading && orderList.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--admin-slate-600)" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "3px solid #E2E8F0",
                borderTopColor: "#B87078",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px"
              }}
            />
            <p style={{ margin: 0, fontSize: "13px" }}>Loading orders from database...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty-state">
            <ShoppingBag size={36} className="admin-empty-state__icon" strokeWidth={1.5} />
            <h3 className="admin-empty-state__title">No orders found</h3>
            <p className="admin-empty-state__desc">
              {searchQuery || statusFilter !== "ALL"
                ? "No orders match the current search or status filter."
                : "No customer orders have been recorded in the database yet. When customers check out on the storefront, transactions will appear here."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Order #</th>
                <th>Fulfillment Stage</th>
                <th>Recipient / Customer</th>
                <th>Items Summary</th>
                <th>Payment</th>
                <th style={{ textAlign: "right" }}>Total Amount</th>
                <th>Date Placed</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const oid = order.orderId || order.id;
                const paymentStatus = order.payment?.status || order.paymentStatus || "Completed";
                const isPaid = String(paymentStatus).toLowerCase() === "completed" || String(paymentStatus).toLowerCase() === "success";

                return (
                  <tr key={oid}>
                    <td style={{ fontWeight: 600, color: "var(--admin-ink)" }} className="admin-tabular">
                      #{oid}
                    </td>

                    <td>
                      <OrderStatusBadge status={order.status} showStepper />
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ color: "var(--admin-ink)", fontSize: "13px" }}>
                          {order.shippingAddress?.name || `User #${order.userId}`}
                        </strong>
                        <span style={{ fontSize: "11px", color: "var(--admin-slate-600)" }}>
                          {order.shippingAddress?.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : (order.shippingAddress?.phone || "Standard Shipping")}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: "12px", color: "var(--admin-ink)", fontWeight: 500 }}>
                          {order.items?.length || 0} {(order.items?.length || 0) === 1 ? "garment" : "garments"}
                        </span>
                        {order.items?.[0] && (
                          <span style={{ fontSize: "11px", color: "var(--admin-slate-600)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {order.items[0].productName} ({order.items[0].size})
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: isPaid ? "#ECFDF5" : "#FFFBEB",
                          color: isPaid ? "#065F46" : "#B45309",
                          fontSize: "11px"
                        }}
                      >
                        <span className="status-dot" style={{ backgroundColor: isPaid ? "#10B981" : "#F59E0B" }} />
                        <span>{paymentStatus}</span>
                      </span>
                    </td>

                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--admin-ink)" }} className="admin-tabular">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td style={{ color: "var(--admin-slate-600)", fontSize: "12px" }}>
                      {order.placedAt ? new Date(order.placedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="admin-table-btn"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Eye size={12} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details & Status Update Drawer */}
      <OrderDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdated={handleReload}
      />
    </div>
  );
}
