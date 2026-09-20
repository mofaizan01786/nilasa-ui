"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Coupon } from "@/lib/types";
import { formatPrice } from "@/lib/catalog";
import { fetchCouponsAdminPaged } from "@/lib/dotnet-backend";
import { CouponDrawer } from "./CouponDrawer";
import { AdminToast } from "./AdminToast";
import { AdminTablePagination } from "./AdminTablePagination";
import {
  Plus,
  Pencil,
  Tag,
  Search,
  RefreshCw
} from "lucide-react";

interface AdminCouponsClientProps {
  coupons?: Coupon[];
}

export function AdminCouponsClient({ coupons: initialCoupons }: AdminCouponsClientProps) {
  const router = useRouter();

  // Data & Pagination States
  const [couponList, setCouponList] = useState<Coupon[]>(initialCoupons || []);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadPagedCoupons = useCallback(async (page: number, size: number, query: string) => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("nilasa-auth-token") || undefined
          : undefined;

      const result = await fetchCouponsAdminPaged(
        page,
        size,
        query || undefined,
        token
      );

      if (result && Array.isArray(result.items)) {
        setCouponList(result.items);
        setHasMore(result.hasMore);
        if (result.totalCount !== undefined) {
          setTotalCount(result.totalCount);
        }
        if (result.totalPages !== undefined) {
          setTotalPages(result.totalPages);
        }
      }
    } catch (err) {
      console.error("[AdminCoupons] Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPagedCoupons(currentPage, pageSize, searchQuery);
  }, [currentPage, pageSize, loadPagedCoupons]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadPagedCoupons(1, pageSize, val);
    }, 350);
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

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setDrawerOpen(true);
  };

  const handleReload = async (msg?: string) => {
    if (msg) setToastMessage(msg);
    await loadPagedCoupons(currentPage, pageSize, searchQuery);
    router.refresh();
  };

  const filteredCoupons = useMemo(() => {
    let list = [...couponList];

    if (statusFilter === "ACTIVE") {
      list = list.filter((c) => c.isActive || c.active);
    } else if (statusFilter === "DISABLED") {
      list = list.filter((c) => !c.isActive && !c.active);
    }

    return list;
  }, [couponList, statusFilter]);

  const displayCount = totalCount !== undefined ? totalCount : filteredCoupons.length;

  return (
    <div className="admin-page-root">
      {toastMessage && (
        <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons & Discounts ({displayCount})</h1>
          <p className="admin-page-subtitle">Promotional promo codes and minimum order rules</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => loadPagedCoupons(currentPage, pageSize, searchQuery)}
            className="admin-btn-secondary"
            title="Refresh coupons list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="admin-btn-primary"
          >
            <Plus size={15} strokeWidth={2} />
            <span>Add coupon</span>
          </button>
        </div>
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
              onChange={(e) => handleSearchChange(e.target.value)}
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
          {loading ? (
            <span>Loading coupons...</span>
          ) : (
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong> • Showing {filteredCoupons.length} coupons
            </span>
          )}
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
          <div className="admin-table-scroll">
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
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        <AdminTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalCount}
          totalPages={totalPages}
          currentCount={couponList.length}
          hasMore={hasMore}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[20, 50, 100]}
          itemLabel="coupons"
          loading={loading}
        />
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
