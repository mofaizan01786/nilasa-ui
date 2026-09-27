"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/catalog";
import { fetchOrdersAdminPaged } from "@/lib/dotnet-backend";
import { OrderDrawer } from "./OrderDrawer";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { AdminToast } from "./AdminToast";
import { AdminTablePagination } from "./AdminTablePagination";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Eye
} from "lucide-react";

interface AdminOrdersClientProps {
  orders?: Order[];
  currentStatusFilter?: string;
}

export function AdminOrdersClient({
  orders: initialOrders,
  currentStatusFilter = ""
}: AdminOrdersClientProps) {
  const router = useRouter();

  // Data & Pagination States
  const [orderList, setOrderList] = useState<Order[]>(initialOrders || []);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(currentStatusFilter || "ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadPagedOrders = useCallback(async (page: number, size: number, status: string, query: string) => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("nilasa-auth-token") || undefined
          : undefined;

      const result = await fetchOrdersAdminPaged(
        page,
        size,
        status === "ALL" ? undefined : status,
        query || undefined,
        token
      );

      if (result && Array.isArray(result.items)) {
        setOrderList(result.items);
        setHasMore(result.hasMore);
        if (result.totalCount !== undefined) {
          setTotalCount(result.totalCount);
        }
        if (result.totalPages !== undefined) {
          setTotalPages(result.totalPages);
        }
      }
    } catch (err) {
      console.error("[AdminOrders] Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPagedOrders(currentPage, pageSize, statusFilter, searchQuery);
  }, [currentPage, pageSize, statusFilter, loadPagedOrders]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadPagedOrders(1, pageSize, statusFilter, val);
    }, 350);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReload = async (msg?: string) => {
    if (msg) setToastMessage(msg);
    await loadPagedOrders(currentPage, pageSize, statusFilter, searchQuery);
    router.refresh();
  };

  const filteredOrders = useMemo(() => {
    let list = [...orderList];

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
  }, [orderList, searchQuery]);

  const startCount = orderList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endCount = (currentPage - 1) * pageSize + orderList.length;

  return (
    <div className="admin-page-root">
      {toastMessage && (
        <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            Customer Orders {totalCount !== undefined ? `(${totalCount})` : `(Page ${currentPage})`}
          </h1>
          <p className="admin-page-subtitle">
            Showing {startCount} – {endCount} {totalCount ? `of ${totalCount}` : ""} transactions across fulfillment stages
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => loadPagedOrders(currentPage, pageSize, statusFilter, searchQuery)}
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="admin-search-input"
              style={{ width: 260 }}
            />
          </div>

          {/* Status Dropdown Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
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

        <div style={{ fontSize: "12.5px", color: "var(--admin-slate-600)" }}>
          {loading ? (
            <span>Loading orders page {currentPage}...</span>
          ) : (
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong> • Showing {filteredOrders.length} orders
            </span>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="admin-table-container">
        {loading && orderList.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--admin-slate-600)" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "3px solid #E2E8F0",
                borderTopColor: "var(--admin-primary, #7A2832)",
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
                : "No customer orders have been recorded in the database yet."}
            </p>
          </div>
        ) : (
          <div className="admin-table-scroll">
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
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        <AdminTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalCount}
          totalPages={totalPages}
          currentCount={orderList.length}
          hasMore={hasMore}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[20, 50, 100]}
          itemLabel="orders"
          loading={loading}
        />
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
