"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DiscountType } from "@/lib/types";

export default function NewCouponPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as DiscountType,
    discountValue: "15",
    minOrderAmount: "2000",
    maximumDiscount: "1000",
    usageLimit: "100",
    usagePerUser: "1",
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    active: true
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 600));
    router.push("/admin/coupons");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow eyebrow--gold">PROMOTION CREATION</span>
          <h1 className="admin-page-title">Create New Promo Coupon</h1>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="form-grid">
            <label className="field">
              <span>Coupon Code *</span>
              <input
                type="text"
                required
                placeholder="e.g. FESTIVE20"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </label>

            <label className="field">
              <span>Discount Type *</span>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                className="field-select"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Fixed Amount Off (₹ INR)</option>
              </select>
            </label>

            <label className="field">
              <span>Discount Value *</span>
              <input
                type="number"
                required
                placeholder="15"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Min Order Amount (₹)</span>
              <input
                type="number"
                placeholder="2000"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Max Discount Cap (₹)</span>
              <input
                type="number"
                placeholder="1000"
                value={formData.maximumDiscount}
                onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Total Usage Limit</span>
              <input
                type="number"
                placeholder="100"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Valid From</span>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Valid To</span>
              <input
                type="date"
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 14, justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" onClick={() => router.back()} className="button" style={{ background: "#E2E8F0", color: "#475569" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="button button--indigo">
              {submitting ? "Saving..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
