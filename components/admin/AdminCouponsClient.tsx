"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Coupon } from "@/lib/types";
import { formatPrice } from "@/lib/catalog";
import { CouponDrawer } from "./CouponDrawer";
import { AdminToast } from "./AdminToast";
import {
  Plus,
  Pencil,
  Tag,
  Search
} from "lucide-react";

interface AdminCouponsClientProps {
  coupons: Coupon[];
}

export function AdminCouponsClient({ coupons }: AdminCouponsClientProps) {
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setDrawerOpen(true);
  };

  const handleReload = (msg?: string) => {
    if (msg) setToastMessage(msg);
    router.refresh();
  };

  const filteredCoupons = useMemo(() => {
    let list = [...coupons];

    if (statusFilter === "ACTIVE") {
      list = list.filter((c) => c.isActive || c.active);
    } else if (statusFilter === "DISABLED") {
      list = list.filter((c) => !c.isActive && !c.active);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => c.code.toLowerCase().includes(q));
    }

    return list;
  }, [coupons, searchQuery, statusFilter]);

  return (
    <div>
      {toastMessage && (
        <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons & Discounts ({filteredCoupons.length})</h1>
          <p className="admin-page-subtitle">Promotional promo codes and minimum order rules</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="admin-btn-primary"
        >
          <Plus size={15} strokeWidth={2} />
          <span>Add coupon</span>
        </button>
      </div>

      {/* Slim Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <Search
              size={14}
              color="var(--admin-slate-600)"
              style={{ position: "absolute", left: 10, pointerEvents: "none" }}
            />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="ALL">All Coupons</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>

        <div style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
          Showing {filteredCoupons.length} of {coupons.length} coupons
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-table-container">
        {filteredCoupons.length === 0 ? (
          <div className="admin-empty-state">
            <Tag size={36} className="admin-empty-state__icon" strokeWidth={1.5} />
            <h3 className="admin-empty-state__title">No coupons found</h3>
            <p className="admin-empty-state__desc">
              {searchQuery || statusFilter !== "ALL"
                ? "No promotional coupons match your filter."
                : "No discount coupons created yet. Create a percentage or flat discount code to boost checkout conversion."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="admin-btn-primary"
            >
              <Plus size={14} />
              <span>Add your first coupon</span>
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Min Cart Amount</th>
                <th>Max Cap</th>
                <th>Validity</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => {
                const cid = coupon.couponId || coupon.id || 0;
                const isAct = coupon.active || coupon.isActive;
                return (
                  <tr key={cid || coupon.code}>
                    <td>
                      <code style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-ink)", background: "#F1F3F7", padding: "3px 8px", borderRadius: 4, letterSpacing: "0.04em" }}>
                        {coupon.code}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--admin-ink)" }} className="admin-tabular">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT`}
                    </td>
                    <td style={{ color: "var(--admin-slate-600)" }} className="admin-tabular">
                      {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : "None"}
                    </td>
                    <td style={{ color: "var(--admin-slate-600)" }} className="admin-tabular">
                      {(coupon.maximumDiscount || coupon.maxDiscountAmount) ? formatPrice(Number(coupon.maximumDiscount || coupon.maxDiscountAmount)) : "No cap"}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
                      {coupon.validTo ? new Date(coupon.validTo).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Indefinite"}
                    </td>
                    <td>
                      <span className={`status-badge ${isAct ? "status-badge--published" : "status-badge--draft"}`}>
                        <span className="status-dot" />
                        <span>{isAct ? "Active" : "Disabled"}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(coupon)}
                        className="admin-table-btn"
                      >
                        <Pencil size={12} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Coupon Drawer (Add / Edit) */}
      <CouponDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        coupon={editingCoupon}
        onSaved={handleReload}
      />
    </div>
  );
}
