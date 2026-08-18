"use client";

import { useState, useEffect, FormEvent } from "react";
import { Category } from "@/lib/types";
import { AdminDrawer } from "./AdminDrawer";
import { createCategory, updateCategory } from "@/lib/api";
import { AlertCircle } from "lucide-react";

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  allCategories: Category[];
  onSaved: (msg?: string) => void;
}

export function CategoryDrawer({
  isOpen,
  onClose,
  category,
  allCategories,
  onSaved
}: CategoryDrawerProps) {
  const isEditing = !!category;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setParentCategoryId(category.parentCategoryId ? String(category.parentCategoryId) : "");
    } else {
      setName("");
      setSlug("");
      setParentCategoryId("");
    }
    setError("");
    setFieldErrors({});
  }, [category, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
    if (!isEditing) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(autoSlug);
      if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const newFieldErrors: { [k: string]: string } = {};
    if (!name.trim()) newFieldErrors.name = "Category name is required.";
    if (!slug.trim()) newFieldErrors.slug = "URL slug is required.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      const parentId = parentCategoryId ? parseInt(parentCategoryId, 10) : null;
      if (isEditing && category) {
        const catId = category.categoryId || category.id || 0;
        const res = await updateCategory(catId, {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          parentCategoryId: parentId
        });
        if (!res) {
          setError("Failed to update category. Please verify input.");
          setLoading(false);
          return;
        }
      } else {
        const res = await createCategory({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          parentCategoryId: parentId
        });
        if (!res) {
          setError("Failed to create category. Slug may already exist.");
          setLoading(false);
          return;
        }
      }

      onSaved(isEditing ? "Category changes saved" : "Category created");
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
      title={isEditing ? `Edit Category #${category?.categoryId || category?.id}` : "Add Category"}
      subtitle={isEditing ? "Update taxonomy name and URL routing" : "Create a new product taxonomy category"}
      width={480}
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
                Category Name <strong className="req-star">*</strong>
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Silk Dupattas"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {fieldErrors.name && <span className="field-error-msg">{fieldErrors.name}</span>}
            </label>

            <label className="field wide">
              <span>
                URL Slug <strong className="req-star">*</strong>
              </span>
              <input
                type="text"
                required
                placeholder="silk-dupattas"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              {fieldErrors.slug && <span className="field-error-msg">{fieldErrors.slug}</span>}
            </label>

            <label className="field wide">
              <span>Parent Category</span>
              <select
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
                className="field-select"
              >
                <option value="">None (Top-Level Category)</option>
                {allCategories
                  .filter((c) => (category ? (c.categoryId || c.id) !== (category.categoryId || category.id) : true))
                  .map((c) => (
                    <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                      #{c.categoryId || c.id} — {c.name}
                    </option>
                  ))}
              </select>
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
            {loading ? "Saving..." : isEditing ? "Save category changes" : "Create category"}
          </button>
        </div>
      </form>
    </AdminDrawer>
  );
}
