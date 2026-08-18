"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductStatus } from "@/lib/types";

export function EditProductClient({ product }: { product: Product }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string>(product.imageUrl || "");

  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    basePrice: String(product.basePrice),
    categoryId: String(product.categoryId),
    status: product.status,
    fabric: product.fabric || "",
    color: product.color || "",
    badge: product.badge || "",
    description: product.description || ""
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await new Promise((res) => setTimeout(res, 600));
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {error && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: 12, borderRadius: 8 }}>{error}</div>}

      <div className="form-grid">
        <label className="field">
          <span>Product Name *</span>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </label>

        <label className="field">
          <span>URL Slug *</span>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Base Price (₹ INR) *</span>
          <input
            type="number"
            required
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Status *</span>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
            className="field-select"
          >
            <option value="Published">Published (Live)</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </label>

        <label className="field">
          <span>Category ID *</span>
          <input
            type="number"
            required
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Fabric & Weave</span>
          <input
            type="text"
            value={formData.fabric}
            onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
          />
        </label>
      </div>

      <label className="field">
        <span>Product Description</span>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </label>

      {/* Image Upload Area */}
      <div style={{ border: "2px dashed #CBD5E1", padding: 20, borderRadius: 12, background: "#F8FAFC" }}>
        <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
          📷 Replace Primary Image (Multipart upload, JPEG/PNG/WebP ≤5MB)
        </span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} style={{ marginTop: 8 }} />
        {imagePreview && (
          <div style={{ marginTop: 14 }}>
            <img src={imagePreview} alt="Preview" style={{ height: 120, borderRadius: 8, objectFit: "cover" }} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 14, justifyContent: "flex-end", marginTop: 10 }}>
        <button type="button" onClick={() => router.back()} className="button" style={{ background: "#E2E8F0", color: "#475569" }}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="button button--indigo">
          {submitting ? "Updating SKU..." : "Save SKU Changes"}
        </button>
      </div>
    </form>
  );
}
