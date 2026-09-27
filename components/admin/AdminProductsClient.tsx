"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/lib/types";
import { formatPrice, getProductImage } from "@/lib/catalog";
import { ProductDrawer } from "./ProductDrawer";
import { ProductStatusToggle } from "./ProductStatusToggle";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { AdminToast } from "./AdminToast";
import { AdminTablePagination } from "./AdminTablePagination";
import { deleteProduct, fetchProductsAdminPaged, fetchAllProductsAdmin } from "@/lib/dotnet-backend";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  ArrowUpDown,
  RefreshCw
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

  // Data & Pagination States
  const [productList, setProductList] = useState<Product[]>(initialProducts || products || []);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);

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

  // Deduplicate categories for clean filter dropdown
  const deduplicatedCategories = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) {
      const key = c.name.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, c);
      }
    }
    return Array.from(map.values());
  }, [categories]);

  // Fetch all inventory products for unified authoritative filtering
  const loadAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("nilasa-auth-token") || undefined
          : undefined;

      const data = await fetchAllProductsAdmin(undefined, token);
      if (Array.isArray(data) && data.length > 0) {
        setProductList(data);
      }
    } catch (err) {
      console.error("[AdminProducts] Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      loadAllProducts();
    }
  }, [initialProducts, loadAllProducts]);

  // Search, Status, Category, and Sort Filter across complete catalog
  const filteredProducts = useMemo(() => {
    let list = [...productList];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.categoryName || "").toLowerCase().includes(q) ||
          (p.tags || "").toLowerCase().includes(q) ||
          String(p.productId || p.id).includes(q)
      );
    }

    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter((p) => (p.status || "Published").toLowerCase() === statusFilter.toLowerCase());
    }

    if (categoryFilter && categoryFilter !== "ALL") {
      const catId = parseInt(categoryFilter, 10);
      const targetCat = deduplicatedCategories.find((c) => (c.categoryId || c.id) === catId);
      list = list.filter((p) => {
        if (p.categoryId === catId) return true;
        if (targetCat && (p.categoryName || "").toLowerCase().trim() === targetCat.name.toLowerCase().trim()) return true;
        return false;
      });
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
  }, [productList, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder, deduplicatedCategories]);

  const totalFilteredCount = filteredProducts.length;
  const calculatedTotalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  // Current page sliced items
  const displayedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > calculatedTotalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        loadAllProducts();
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
    loadAllProducts();
    router.refresh();
  };

  const toggleSort = (field: "name" | "price" | "id") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const startCount = totalFilteredCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endCount = Math.min(currentPage * pageSize, totalFilteredCount);

  return (
    <div className="admin-page-root">
      {toastMessage && (
        <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            Products ({totalFilteredCount})
          </h1>
          <p className="admin-page-subtitle">
            Showing {startCount} – {endCount} of {totalFilteredCount} catalog SKUs {categoryFilter !== "ALL" ? "in selected category" : "across collections"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => loadAllProducts()}
            disabled={loading}
            className="admin-btn-secondary"
            title="Refresh Inventory"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? "admin-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="admin-btn-primary"
          >
            <Plus size={15} strokeWidth={2} />
            <span>Add product SKU</span>
          </button>
        </div>
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="admin-search-input"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
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
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
            className="admin-select-filter"
          >
            <option value="ALL">All Categories</option>
            {deduplicatedCategories.map((c) => (
              <option key={c.categoryId || (c as any).id} value={c.categoryId || (c as any).id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: "12.5px", color: "var(--admin-slate-600)" }}>
          {loading ? (
            <span>Loading catalog...</span>
          ) : (
            <span>
              Page <strong>{currentPage}</strong> of <strong>{calculatedTotalPages}</strong> • Showing {displayedProducts.length} items
            </span>
          )}
        </div>
      </div>

      {/* Data Table Container */}
      <div className="admin-table-container">
        {displayedProducts.length === 0 && !loading ? (
          <div className="admin-empty-state">
            <Package size={36} className="admin-empty-state__icon" strokeWidth={1.5} />
            <h3 className="admin-empty-state__title">No products found</h3>
            <p className="admin-empty-state__desc">
              {searchQuery || statusFilter !== "ALL"
                ? "No products matched your current filters. Try resetting your search."
                : "No products in your catalog on this page."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="admin-btn-primary"
            >
              <Plus size={14} />
              <span>Add product</span>
            </button>
          </div>
        ) : (
          <div className="admin-table-scroll">
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
                {displayedProducts.map((product) => {
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
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <strong style={{ color: "var(--admin-ink)" }}>{product.name}</strong>
                        {product.isBestseller && (
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: 4, backgroundColor: "rgba(184, 145, 46, 0.12)", color: "#B8912E" }}>
                            🔥 Bestseller
                          </span>
                        )}
                        {product.isNewArrival && (
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: 4, backgroundColor: "rgba(4, 120, 87, 0.12)", color: "#047857" }}>
                            ✨ New
                          </span>
                        )}
                        {product.isFeatured && (
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: 4, backgroundColor: "rgba(124, 89, 153, 0.12)", color: "#7C5999" }}>
                            🌟 Featured
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--admin-slate-600)", fontFamily: "var(--font-mono)", display: "block" }}>
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
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        <AdminTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalFilteredCount}
          totalPages={calculatedTotalPages}
          currentCount={displayedProducts.length}
          hasMore={currentPage < calculatedTotalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[20, 50, 100]}
          itemLabel="products"
          loading={loading}
        />
      </div>

      {/* Product Drawer (Create / Edit) */}
      <ProductDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={editingProduct}
        categories={deduplicatedCategories}
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
