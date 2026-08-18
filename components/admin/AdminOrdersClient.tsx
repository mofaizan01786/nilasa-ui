"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/catalog";
import { OrderDrawer } from "./OrderDrawer";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { AdminToast } from "./AdminToast";
import {
  ShoppingBag,
  Receipt,
  Search
} from "lucide-react";

interface AdminOrdersClientProps {
  orders: Order[];
  currentStatusFilter?: string;
}

export function AdminOrdersClient({
  orders,
  currentStatusFilter = ""
}: AdminOrdersClientProps) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(currentStatusFilter || "ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter(
        (o) => o.status.toLowerCase() === statusFilter.toLowerCase()
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
  }, [orders, statusFilter, searchQuery]);

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
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-table-container">
        {filteredOrders.length === 0 ? (
          <div className="admin-empty-state">
            <ShoppingBag size={36} className="admin-empty-state__icon" strokeWidth={1.5} />
            <h3 className="admin-empty-state__title">No orders found</h3>
            <p className="admin-empty-state__desc">
              {searchQuery || statusFilter !== "ALL"
                ? "No orders match your filter criteria."
                : "No customer orders have been placed yet. New orders will appear here automatically."}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Order ID</th>
                <th>Fulfillment Stage</th>
                <th>Items</th>
                <th style={{ textAlign: "right" }}>Total Amount</th>
                <th>Payment</th>
                <th>Order Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const oid = order.orderId || order.id || 0;
                return (
                  <tr key={oid}>
                    <td style={{ fontWeight: 600, color: "var(--admin-ink)" }} className="admin-tabular">
                      #{oid}
                    </td>
                    <td>
                      {/* Compact Progress Line Signature Element */}
                      <OrderStatusBadge status={order.status} showStepper />
                    </td>
                    <td>
                      <span style={{ color: "var(--admin-slate-600)" }}>
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "var(--admin-ink)" }} className="admin-tabular">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td>
                      {order.payment ? (
                        <span className="status-badge status-badge--published" style={{ fontSize: "11px" }}>
                          <span className="status-dot" />
                          <span>{order.payment.status}</span>
                        </span>
                      ) : (
                        <span style={{ color: "var(--admin-slate-400)" }}>—</span>
                      )}
                    </td>
                    <td style={{ color: "var(--admin-slate-600)", fontSize: "12px" }}>
                      {new Date(order.placedAt || order.createdAt || "").toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="admin-table-btn"
                      >
                        <Receipt size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Drawer */}
      <OrderDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onRefunded={() => {
          setToastMessage(`Refund processed for Order #${selectedOrder?.orderId || selectedOrder?.id}`);
          router.refresh();
        }}
      />
    </div>
  );
}
