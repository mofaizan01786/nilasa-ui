"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, Category, ProductStatus } from "@/lib/types";
import { formatPrice, getProductImage } from "@/lib/catalog";
import { ProductDrawer } from "./ProductDrawer";
import { ProductStatusToggle } from "./ProductStatusToggle";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { AdminToast } from "./AdminToast";
import { deleteProduct } from "@/lib/dotnet-backend";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  ArrowUpDown
} from "lucide-react";

interface AdminProductsClientProps {
  products?: Product[];
  initialProducts?: Product[];
  categories: Category[];
  currentStatusFilter?: string;
}

export function AdminProductsClient({
  products = [],
  initialProducts,
  categories,
  currentStatusFilter = ""
}: AdminProductsClientProps) {
  const router = useRouter();
  const rawProducts = initialProducts || products;

  // Drawers & Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Slim Filter Bar States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(currentStatusFilter || "ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"name" | "price" | "id">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setDrawerOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const prodId = productToDelete.productId || productToDelete.id || 0;
    setDeleteLoading(true);

    try {
      const success = await deleteProduct(prodId);
      if (success) {
        setDeleteModalOpen(false);
        setToastMessage(`Archived "${productToDelete.name}"`);
        router.refresh();
      }
    } catch {
      // Keep modal open on network error
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReload = (msg?: string) => {
    if (msg) setToastMessage(msg);
    router.refresh();
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter(
        (p) => p.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (categoryFilter && categoryFilter !== "ALL") {
      const catId = parseInt(categoryFilter, 10);
      list = list.filter((p) => p.categoryId === catId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.variants?.some((v) => v.sku?.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === "price") {
        return sortOrder === "asc"
          ? (a.basePrice || 0) - (b.basePrice || 0)
          : (b.basePrice || 0) - (a.basePrice || 0);
      }
      const idA = a.productId || a.id || 0;
      const idB = b.productId || b.id || 0;
      return sortOrder === "asc" ? idA - idB : idB - idA;
    });

    return list;
  }, [rawProducts, statusFilter, categoryFilter, searchQuery, sortBy, sortOrder]);

  const toggleSort = (field: "name" | "price" | "id") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div>
      {toastMessage && (
        <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products ({filteredProducts.length})</h1>
          <p className="admin-page-subtitle">Manage catalog SKUs, size variants and inventory stock</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="admin-btn-primary"
        >
          <Plus size={15} strokeWidth={2} />
          <span>Add product SKU</span>
        </button>
      </div>

      {/* Slim Filter Bar above Table */}
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
              placeholder="Search SKU or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="ALL">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
          Showing {filteredProducts.length} of {rawProducts.length} products
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-table-container">
        {filteredProducts.length === 0 ? (
          <div className="admin-empty-state">
            <Package size={36} className="admin-empty-state__icon" strokeWidth={1.5} />
            <h3 className="admin-empty-state__title">No products found</h3>
            <p className="admin-empty-state__desc">
              {searchQuery || statusFilter !== "ALL"
                ? "No products matched your current filters. Try resetting your search."
                : "No products in your catalog yet. Create your first product SKU to get started."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="admin-btn-primary"
            >
              <Plus size={14} />
              <span>Add your first product</span>
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>Photo</th>
                <th
                  onClick={() => toggleSort("name")}
                  style={{ cursor: "pointer" }}
                  title="Sort by Title"
                >
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span>Product Name</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th>Category</th>
                <th
                  onClick={() => toggleSort("price")}
                  style={{ cursor: "pointer", textAlign: "right" }}
                  title="Sort by Price"
                >
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    <span>Price</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th style={{ textAlign: "right" }}>Variants</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const pid = product.productId || product.id || 0;
                const img = getProductImage(product);
                return (
                  <tr key={pid || product.slug}>
                    <td>
                      <div
                        style={{
                          width: 36,
                          height: 44,
                          position: "relative",
                          borderRadius: 4,
                          overflow: "hidden",
                          background: "#F1F3F7",
                          border: "1px solid var(--admin-slate-200)"
                        }}
                      >
                        <Image src={img} alt={product.name} fill style={{ objectFit: "cover" }} />
                      </div>
                    </td>
                    <td>
                      <strong style={{ display: "block", color: "var(--admin-ink)" }}>{product.name}</strong>
                      <span style={{ fontSize: "11px", color: "var(--admin-slate-600)", fontFamily: "var(--font-mono)" }}>
                        /product/{product.slug}
                      </span>
                    </td>
                    <td style={{ color: "var(--admin-slate-600)" }}>
                      {product.categoryName || `Category #${product.categoryId}`}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }} className="admin-tabular">
                      {formatPrice(product.basePrice)}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--admin-slate-600)" }} className="admin-tabular">
                      {product.variants?.length || 0}
                    </td>
                    <td>
                      <ProductStatusToggle
                        productId={pid}
                        currentStatus={product.status}
                        onStatusChange={() => handleReload("Status updated")}
                      />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="admin-table-btn"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(product)}
                          className="admin-table-btn admin-table-btn--danger"
                        >
                          <Trash2 size={12} />
                          <span>Archive</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Drawer (Create / Edit) */}
      <ProductDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={editingProduct}
        categories={categories}
        onSaved={handleReload}
      />

      {/* Delete / Archive Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Archive Product SKU"
        itemName={productToDelete?.name || ""}
        loading={deleteLoading}
      />
    </div>
  );
}
