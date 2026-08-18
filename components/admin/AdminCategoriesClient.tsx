"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/types";
import { CategoryDrawer } from "./CategoryDrawer";
import { AdminToast } from "./AdminToast";
import {
  Plus,
  Pencil,
  FolderTree,
  Search
} from "lucide-react";

interface AdminCategoriesClientProps {
  categories: Category[];
}

export function AdminCategoriesClient({ categories }: AdminCategoriesClientProps) {
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setDrawerOpen(true);
  };

  const handleReload = (msg?: string) => {
    if (msg) setToastMessage(msg);
    router.refresh();
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        String(c.categoryId || c.id).includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <div>
      {toastMessage && (
        <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories ({filteredCategories.length})</h1>
          <p className="admin-page-subtitle">Catalog taxonomy and navigation hierarchy</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="admin-btn-primary"
        >
          <Plus size={15} strokeWidth={2} />
          <span>Add category</span>
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
              placeholder="Search category name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
              style={{ width: 260 }}
            />
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-table-container">
        {filteredCategories.length === 0 ? (
          <div className="admin-empty-state">
            <FolderTree size={36} className="admin-empty-state__icon" strokeWidth={1.5} />
            <h3 className="admin-empty-state__title">No categories found</h3>
            <p className="admin-empty-state__desc">
              {searchQuery
                ? "No categories matched your search term."
                : "No taxonomy categories configured yet. Categories structure storefront navigation."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="admin-btn-primary"
            >
              <Plus size={14} />
              <span>Add your first category</span>
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Category Name</th>
                <th>URL Slug</th>
                <th>Parent Category</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => {
                const cid = cat.categoryId || cat.id || 0;
                const parent = categories.find((c) => (c.categoryId || c.id) === cat.parentCategoryId);
                return (
                  <tr key={cid || cat.slug}>
                    <td style={{ color: "var(--admin-slate-600)", fontWeight: 600 }} className="admin-tabular">
                      #{cid}
                    </td>
                    <td>
                      <strong style={{ color: "var(--admin-ink)" }}>{cat.name}</strong>
                    </td>
                    <td>
                      <code style={{ fontSize: "12px", color: "var(--admin-slate-600)", background: "#F1F3F7", padding: "2px 6px", borderRadius: 4 }}>
                        /{cat.slug}
                      </code>
                    </td>
                    <td style={{ color: "var(--admin-slate-600)" }}>
                      {parent ? parent.name : <span style={{ color: "var(--admin-slate-400)" }}>Top-level</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
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

      {/* Category Drawer (Add / Edit) */}
      <CategoryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={editingCategory}
        allCategories={categories}
        onSaved={handleReload}
      />
    </div>
  );
}
