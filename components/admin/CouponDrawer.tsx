"use client";

import { useState, useEffect, FormEvent } from "react";
import { Coupon, DiscountType } from "@/lib/types";
import { AdminDrawer } from "./AdminDrawer";
import { createCoupon, updateCoupon } from "@/lib/api";
import { AlertCircle } from "lucide-react";

interface CouponDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
  onSaved: (msg?: string) => void;
}

export function CouponDrawer({
  isOpen,
  onClose,
  coupon,
  onSaved
}: CouponDrawerProps) {
  const isEditing = !!coupon;

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [usagePerUser, setUsagePerUser] = useState("1");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDiscountType(coupon.discountType || "percentage");
      setDiscountValue(String(coupon.discountValue));
      setMinOrderAmount(String(coupon.minOrderAmount || 0));
      setMaxDiscountAmount(coupon.maxDiscountAmount || coupon.maximumDiscount ? String(coupon.maxDiscountAmount || coupon.maximumDiscount) : "");
      setValidFrom(coupon.validFrom ? coupon.validFrom.split("T")[0] : "");
      setValidTo(coupon.validTo ? coupon.validTo.split("T")[0] : "");
      setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : "");
      setUsagePerUser(String(coupon.usagePerUser || 1));
      setIsActive(coupon.isActive ?? coupon.active ?? true);
    } else {
      setCode("");
      setDiscountType("percentage");
      setDiscountValue("15");
      setMinOrderAmount("1999");
      setMaxDiscountAmount("1500");
      const today = new Date().toISOString().split("T")[0];
      const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      setValidFrom(today);
      setValidTo(nextMonth);
      setUsageLimit("500");
      setUsagePerUser("1");
      setIsActive(true);
    }
    setError("");
    setFieldErrors({});
  }, [coupon, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const newFieldErrors: { [k: string]: string } = {};
    if (!code.trim()) newFieldErrors.code = "Coupon code is required.";

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      newFieldErrors.discountValue = "Discount value must be greater than 0.";
    }

    if (discountType === "percentage" && val > 100) {
      newFieldErrors.discountValue = "Percentage discount cannot exceed 100%.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      const minAmount = parseFloat(minOrderAmount) || 0;
      const maxDisc = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
      const limit = usageLimit ? parseInt(usageLimit, 10) : null;
      const perUser = usagePerUser ? parseInt(usagePerUser, 10) : null;
      const fromDate = validFrom ? new Date(validFrom).toISOString() : new Date().toISOString();
      const toDate = validTo ? new Date(validTo).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();

      if (isEditing && coupon) {
        const couponId = coupon.couponId || coupon.id || 0;
        const res = await updateCoupon(couponId, {
          discountValue: val,
          minOrderAmount: minAmount,
          maximumDiscount: maxDisc,
          usageLimit: limit,
          usagePerUser: perUser,
          validFrom: fromDate,
          validTo: toDate,
          isActive: isActive
        });
        if (!res) {
          setError("Failed to update coupon.");
          setLoading(false);
          return;
        }
      } else {
        const res = await createCoupon({
          code: code.trim().toUpperCase(),
          discountType: discountType,
          discountValue: val,
          minOrderAmount: minAmount,
          maximumDiscount: maxDisc,
          usageLimit: limit,
          usagePerUser: perUser,
          validFrom: fromDate,
          validTo: toDate,
          isActive: isActive
        });
        if (!res) {
          setError("Failed to create coupon. Code may already exist.");
          setLoading(false);
          return;
        }
      }

      onSaved(isEditing ? "Coupon changes saved" : "Coupon created");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Coupon #${coupon?.couponId || coupon?.id}` : "Create Coupon"}
      subtitle={isEditing ? "Update discount thresholds, validation limits and validity" : "Launch a percentage or flat discount code for storefront checkout"}
      width={540}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 24 }}>
          {error && (
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
              <span>{error}</span>
            </div>
          )}

          <div className="form-grid">
            <label className="field wide">
              <span>
                Coupon Code <strong className="req-star">*</strong>
              </span>
              <input
                type="text"
                required
                placeholder="e.g. FESTIVE20 or NILASA1000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: "" }));
                }}
              />
              {fieldErrors.code && <span className="field-error-msg">{fieldErrors.code}</span>}
            </label>

            <label className="field">
              <span>
                Discount Type <strong className="req-star">*</strong>
              </span>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="field-select"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Fixed Flat Amount (₹ INR)</option>
              </select>
            </label>

            <label className="field">
              <span>
                Discount Value <strong className="req-star">*</strong>
              </span>
              <input
                type="number"
                required
                min="1"
                placeholder={discountType === "percentage" ? "15" : "500"}
                value={discountValue}
                onChange={(e) => {
                  setDiscountValue(e.target.value);
                  if (fieldErrors.discountValue) setFieldErrors((prev) => ({ ...prev, discountValue: "" }));
                }}
                className="admin-tabular"
              />
              {fieldErrors.discountValue && <span className="field-error-msg">{fieldErrors.discountValue}</span>}
            </label>

            <label className="field">
              <span>Minimum Cart Amount (₹)</span>
              <input
                type="number"
                min="0"
                placeholder="1999"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="admin-tabular"
              />
            </label>

            <label className="field">
              <span>Maximum Discount Cap (₹)</span>
              <input
                type="number"
                min="0"
                placeholder="Leave blank for no cap"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                className="admin-tabular"
              />
            </label>

            <label className="field">
              <span>Valid From</span>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </label>

            <label className="field">
              <span>Valid To</span>
              <input
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </label>

            <label className="field">
              <span>Total Usage Limit</span>
              <input
                type="number"
                min="1"
                placeholder="500"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="admin-tabular"
              />
            </label>

            <label className="field">
              <span>Usage Per User</span>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={usagePerUser}
                onChange={(e) => setUsagePerUser(e.target.value)}
                className="admin-tabular"
              />
            </label>

            <label
              className="field wide"
              style={{
                flexDirection: "row !important" as "row",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                padding: "10px 12px",
                background: "var(--admin-surface)",
                borderRadius: 6,
                border: "1px solid var(--admin-slate-200)",
                marginTop: 6
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--admin-accent)" }}
              />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--admin-ink)" }}>
                Coupon is active & redeemable at checkout
              </span>
            </label>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="admin-sticky-save-bar">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="admin-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary"
          >
            {loading ? "Saving..." : isEditing ? "Save coupon changes" : "Create coupon"}
          </button>
        </div>
      </form>
    </AdminDrawer>
  );
}
