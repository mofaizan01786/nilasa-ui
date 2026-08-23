import Link from "next/link";
import { fetchAllProductsAdmin, fetchOrdersAdmin, fetchCouponsAdmin, fetchUsersAdmin } from "@/lib/dotnet-backend";
import { formatPrice } from "@/lib/catalog";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import {
  Package,
  ShoppingBag,
  Tag,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  FolderTree
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products = [], orders = [], coupons = [], users = []] = await Promise.all([
    fetchAllProductsAdmin().catch(() => []),
    fetchOrdersAdmin().catch(() => []),
    fetchCouponsAdmin().catch(() => []),
    fetchUsersAdmin().catch(() => [])
  ]);

  const publishedCount = (products || []).filter((p) => p?.status && String(p.status).toLowerCase() === "published").length;
  const draftCount = (products || []).filter((p) => p?.status && String(p.status).toLowerCase() === "draft").length;
  const pendingOrders = (orders || []).filter((o) => {
    const s = o?.status ? String(o.status).toLowerCase() : "";
    return s === "pending" || s === "confirmed";
  }).length;
  const totalRevenue = (orders || []).reduce((acc, o) => acc + (Number(o?.totalAmount) || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard Overview</h1>
          <p className="admin-page-subtitle">Real-time store metrics, fulfillment progress, and catalog summary</p>
        </div>
        <div className="admin-header-actions">
          <Link
            href="/admin/products"
            className="admin-btn-primary admin-action-btn"
          >
            <Plus size={14} />
            <span>Add product</span>
          </Link>
          <Link
            href="/admin/categories"
            className="admin-btn-secondary admin-action-btn"
          >
            <FolderTree size={14} color="var(--admin-slate-600)" />
            <span>Manage categories</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards (Fluid Responsive 2-Col Grid on Mobile) */}
      <div className="admin-kpi-grid">
        <div className="admin-card admin-kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="admin-kpi-label">Catalog SKUs</span>
            <Package size={16} color="var(--admin-accent)" />
          </div>
          <div className="admin-kpi-val admin-tabular">
            {publishedCount} <span className="admin-kpi-sub">({draftCount} drafts)</span>
          </div>
          <Link href="/admin/products" className="admin-kpi-link">
            <span>View products</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className="admin-card admin-kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="admin-kpi-label">Pending Fulfillment</span>
            <ShoppingBag size={16} color="var(--status-pending)" />
          </div>
          <div className="admin-kpi-val admin-tabular">
            {pendingOrders} <span className="admin-kpi-sub">orders</span>
          </div>
          <Link href="/admin/orders?status=pending" className="admin-kpi-link">
            <span>Process orders</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className="admin-card admin-kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="admin-kpi-label">Active Coupons</span>
            <Tag size={16} color="var(--status-published)" />
          </div>
          <div className="admin-kpi-val admin-tabular">
            {coupons.filter((c) => c.isActive || c.active).length} <span className="admin-kpi-sub">active</span>
          </div>
          <Link href="/admin/coupons" className="admin-kpi-link">
            <span>Manage discounts</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className="admin-card admin-kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="admin-kpi-label">Staff & Users</span>
            <Users size={16} color="var(--admin-accent)" />
          </div>
          <div className="admin-kpi-val admin-tabular">
            {users.length} <span className="admin-kpi-sub">accounts</span>
          </div>
          <Link href="/admin/users" className="admin-kpi-link">
            <span>Manage users</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className="admin-card admin-kpi-card admin-kpi-card--wide">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="admin-kpi-label">Gross Sales</span>
            <TrendingUp size={16} color="var(--status-published)" />
          </div>
          <div className="admin-kpi-val admin-tabular" style={{ color: "var(--status-published)" }}>
            {formatPrice(totalRevenue)}
          </div>
          <span style={{ fontSize: "11px", color: "var(--admin-slate-600)" }}>Settled customer orders</span>
        </div>
      </div>

      {/* Recent Orders Ledger */}
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--admin-ink)" }}>
              Recent Orders
            </h3>
            <span style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>Latest 5 customer transactions</span>
          </div>
          <Link href="/admin/orders" style={{ fontSize: "12px", color: "var(--admin-accent)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span>All orders</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: "var(--admin-slate-600)", textAlign: "center", padding: "24px 0", margin: 0, fontSize: "13px" }}>
            No customer orders placed yet.
          </p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Order ID</th>
                  <th>Stage</th>
                  <th>Items</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.orderId || order.id}>
                    <td style={{ fontWeight: 600, color: "var(--admin-ink)" }} className="admin-tabular">
                      #{order.orderId || order.id}
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status} showStepper />
                    </td>
                    <td>
                      <span style={{ color: "var(--admin-slate-600)" }}>{order.items?.length || 0} items</span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "var(--admin-ink)" }} className="admin-tabular">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td style={{ color: "var(--admin-slate-600)", fontSize: "12px" }}>
                      {new Date(order.placedAt || order.createdAt || "").toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/admin/orders/${order.orderId || order.id}`}
                        className="admin-table-btn"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
