"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ProductStatus } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    basePrice: "4990",
    categoryId: "1",
    status: "Draft" as ProductStatus,
    fabric: "Chanderi Silk",
    color: "Royal Indigo",
    badge: "New Arrival",
    description: ""
  });

  const handleNameChange = (name: string) => {
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, name, slug: autoSlug }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds maximum limit of 5MB.");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Simulate/POST create product
      await new Promise((res) => setTimeout(res, 800));
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Failed to create product SKU.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="admin-page-header">
        <div>
          <span className="eyebrow eyebrow--gold">CATALOG CREATION</span>
          <h1 className="admin-page-title">Add New Product SKU</h1>
        </div>
      </div>

      <div className="admin-card">
        {error && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 18 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="form-grid">
            <label className="field">
              <span>Product Title *</span>
              <input
                type="text"
                required
                placeholder="e.g. Lavender Zari Chanderi Suit"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>

            <label className="field">
              <span>URL Slug *</span>
              <input
                type="text"
                required
                placeholder="lavender-zari-chanderi-suit"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Base Price (₹ INR) *</span>
              <input
                type="number"
                required
                placeholder="4990"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Category *</span>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="field-select"
              >
                <option value="1">1 - Suits & Anarkalis</option>
                <option value="2">2 - Kurtis</option>
                <option value="3">3 - Co-Ord Sets</option>
                <option value="4">4 - Unstitched Suits</option>
                <option value="5">5 - Dupattas</option>
                <option value="6">6 - Lehengas</option>
              </select>
            </label>

            <label className="field">
              <span>Status *</span>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                className="field-select"
              >
                <option value="Draft">Draft (Hidden)</option>
                <option value="Published">Published (Live)</option>
                <option value="Archived">Archived</option>
              </select>
            </label>

            <label className="field">
              <span>Fabric & Weave</span>
              <input
                type="text"
                placeholder="Organza Silk / Chanderi"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Primary Color</span>
              <input
                type="text"
                placeholder="Royal Indigo / Lavender"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Badge Tag</span>
              <input
                type="text"
                placeholder="Festive Edit / Bestseller"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              />
            </label>
          </div>

          <label className="field">
            <span>Product Description</span>
            <textarea
              rows={4}
              placeholder="Detailed description of craftsmanship, embroidery, and silhouette..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </label>

          {/* Multipart Image Upload Area */}
          <div style={{ border: "2px dashed #CBD5E1", padding: 24, borderRadius: 12, textAlign: "center", background: "#F8FAFC" }}>
            <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
              📷 Upload Product Imagery (Multipart upload, ≤5MB JPEG/PNG/WebP)
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
              {submitting ? "Saving Product..." : "Save Product SKU"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
