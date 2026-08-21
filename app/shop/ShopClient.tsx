"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Product, Category, FilterOptions, ProductFilterParams } from "@/lib/types";
import { fetchProductsWithFilters, fetchProductFilters } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  RotateCcw,
  Loader2
} from "lucide-react";

// Standard color mapping for visual swatches
const COLOR_HEX_MAP: Record<string, string> = {
  navy: "#1B243B",
  blue: "#2563EB",
  lavender: "#8E6EA8",
  lilac: "#B39DCB",
  purple: "#7C5999",
  olive: "#354232",
  green: "#15803D",
  emerald: "#047857",
  sage: "#849978",
  gold: "#B8912E",
  yellow: "#D97706",
  ivory: "#F7F3ED",
  white: "#FFFFFF",
  cream: "#FDFBF7",
  rose: "#D8B4A0",
  pink: "#EC4899",
  red: "#DC2626",
  maroon: "#7F1D1D",
  black: "#111827",
  grey: "#6B7280",
  gray: "#6B7280",
  brown: "#78350F"
};

function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (normalized.includes(key)) return hex;
  }
  return "#D1D5DB";
}

export function ShopClient({
  initialProducts = [],
  categories = [],
  initialFilters = null,
  fixedCategory,
  categoryTitle,
  categoryDesc
}: {
  initialProducts?: Product[];
  categories?: Category[];
  initialFilters?: FilterOptions | null;
  fixedCategory?: string;
  categoryTitle?: string;
  categoryDesc?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Category URL params
  const qParam = searchParams.get("q") || searchParams.get("search") || "";
  const catParam = searchParams.get("category") || searchParams.get("type") || fixedCategory || "";
  const sizeParam = searchParams.get("size") || "all";
  const colorParam = searchParams.get("color") || "all";
  const minPriceParam = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPriceParam = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const sortParam = searchParams.get("sortBy") || "featured";

  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filters, setFilters] = useState<FilterOptions | null>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  // Active filter selections
  const [selectedCategory, setSelectedCategory] = useState<string>(fixedCategory || catParam || "all");
  const [selectedSize, setSelectedSize] = useState<string>(sizeParam);
  const [selectedColor, setSelectedColor] = useState<string>(colorParam);
  const [minPrice, setMinPrice] = useState<number | "">(minPriceParam ?? "");
  const [maxPrice, setMaxPrice] = useState<number | "">(maxPriceParam ?? "");
  const [sortBy, setSortBy] = useState<string>(sortParam);

  // Modals
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);

  // Load available filter options if not supplied by SSR
  useEffect(() => {
    if (!filters) {
      fetchProductFilters()
        .then((data) => {
          if (data) setFilters(data);
        })
        .catch(() => {});
    }
  }, [filters]);

  // Sync state from URL search params
  useEffect(() => {
    setSelectedCategory(fixedCategory || catParam || "all");
    setSelectedSize(sizeParam);
    setSelectedColor(colorParam);
    setMinPrice(minPriceParam ?? "");
    setMaxPrice(maxPriceParam ?? "");
    setSortBy(sortParam);
  }, [catParam, sizeParam, colorParam, minPriceParam, maxPriceParam, sortParam, fixedCategory]);

  // Master fetch function querying backend filter API
  const applyFilters = useCallback(
    async (params: {
      category?: string;
      size?: string;
      color?: string;
      minP?: number | "";
      maxP?: number | "";
      sort?: string;
      search?: string;
    }) => {
      setIsLoading(true);
      const cat = params.category !== undefined ? params.category : selectedCategory;
      const sz = params.size !== undefined ? params.size : selectedSize;
      const clr = params.color !== undefined ? params.color : selectedColor;
      const minP = params.minP !== undefined ? params.minP : minPrice;
      const maxP = params.maxP !== undefined ? params.maxP : maxPrice;
      const srt = params.sort !== undefined ? params.sort : sortBy;
      const srch = params.search !== undefined ? params.search : qParam;

      // Find category ID if selected by slug
      let catId: number | undefined = undefined;
      if (cat && cat !== "all") {
        const found =
          filters?.categories.find((c) => c.slug.toLowerCase() === cat.toLowerCase()) ||
          categories.find((c) => c.slug.toLowerCase() === cat.toLowerCase() || c.categoryId.toString() === cat);
        if (found) catId = found.categoryId;
      }

      const queryParams: ProductFilterParams = {
        search: srch || undefined,
        categoryId: catId,
        size: sz !== "all" ? sz : undefined,
        color: clr !== "all" ? clr : undefined,
        minPrice: typeof minP === "number" ? minP : undefined,
        maxPrice: typeof maxP === "number" ? maxP : undefined,
        sortBy: srt !== "featured" ? srt : undefined
      };

      try {
        const result = await fetchProductsWithFilters(queryParams);
        setProducts(result);
      } catch {
        // keep previous state
      } finally {
        setIsLoading(false);
      }

      // Update URL query string without page reload
      const newUrlParams = new URLSearchParams();
      if (srch) newUrlParams.set("q", srch);
      if (!fixedCategory && cat && cat !== "all") newUrlParams.set("category", cat);
      if (sz && sz !== "all") newUrlParams.set("size", sz);
      if (clr && clr !== "all") newUrlParams.set("color", clr);
      if (typeof minP === "number") newUrlParams.set("minPrice", minP.toString());
      if (typeof maxP === "number") newUrlParams.set("maxPrice", maxP.toString());
      if (srt && srt !== "featured") newUrlParams.set("sortBy", srt);

      const qs = newUrlParams.toString();
      const basePath = fixedCategory ? `/category/${fixedCategory}` : "/shop";
      startTransition(() => {
        router.push(`${basePath}${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    },
    [selectedCategory, selectedSize, selectedColor, minPrice, maxPrice, sortBy, qParam, filters, categories, router, fixedCategory]
  );

  // Trigger query when pills or sort change
  const handlePillClick = (catSlug: string) => {
    setSelectedCategory(catSlug);
    applyFilters({ category: catSlug });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setSortModalOpen(false);
    applyFilters({ sort: newSort });
  };

  const handleClearAll = () => {
    setSelectedCategory("all");
    setSelectedSize("all");
    setSelectedColor("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("featured");
    setFilterModalOpen(false);
    applyFilters({
      category: "all",
      size: "all",
      color: "all",
      minP: "",
      maxP: "",
      sort: "featured",
      search: ""
    });
  };

  // Derive categories list (combining backend filter data + categories fallback)
  const categoryItems = filters?.categories?.length
    ? filters.categories
    : categories.map((c) => ({
        categoryId: c.categoryId,
        name: c.name,
        slug: c.slug,
        productCount: 0
      }));

  const availableSizes = filters?.sizes?.length
    ? filters.sizes
    : ["S", "M", "L", "XL", "XXL", "Free Size"];

  const availableColors = filters?.colors?.length
    ? filters.colors
    : ["Lavender", "Olive", "Gold", "Ivory", "Navy", "Rose", "Emerald"];

  const activeFiltersCount =
    (!fixedCategory && selectedCategory !== "all" ? 1 : 0) +
    (selectedSize !== "all" ? 1 : 0) +
    (selectedColor !== "all" ? 1 : 0) +
    (typeof minPrice === "number" || typeof maxPrice === "number" ? 1 : 0);

  return (
    <div className="mobile-shop-experience">
      {/* ── Compact Luxury Shop Header ── */}
      <section className="shop-header-compact">
        <div className="shop-header-compact-inner">
          <div className="shop-title-group">
            <h1 className="shop-compact-title">
              {categoryTitle ||
                (qParam
                  ? `Results for "${qParam}"`
                  : selectedCategory !== "all"
                  ? categoryItems.find((c) => c.slug === selectedCategory)?.name || "All Collections"
                  : "All Collections")}
            </h1>
            {categoryDesc && (
              <p style={{ color: "var(--ink-muted)", fontSize: "0.85rem", margin: "4px 0 0 0", maxWidth: 600 }}>
                {categoryDesc}
              </p>
            )}
            <span className="shop-compact-count">
              ({products.length} {products.length === 1 ? "piece" : "pieces"})
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. Dynamic Category Filter Pills Row (Only on general /shop page, never on specific category pages) ── */}
      {!fixedCategory && categoryItems.length > 0 && (
        <nav className="shop-pills-row" aria-label="Category Filters">
          <div className="shop-pills-scroll">
            <button
              type="button"
              onClick={() => handlePillClick("all")}
              className={`shop-pill-chip ${selectedCategory === "all" ? "active" : ""}`}
            >
              <span>All</span>
            </button>
            {categoryItems.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
              return (
                <button
                  key={cat.categoryId || cat.slug}
                  type="button"
                  onClick={() => handlePillClick(cat.slug)}
                  className={`shop-pill-chip ${isActive ? "active" : ""}`}
                >
                  <span>{cat.name}</span>
                  {cat.productCount > 0 && (
                    <span style={{ opacity: 0.7, fontSize: "0.7rem", marginLeft: 4 }}>
                      ({cat.productCount})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ── 3. Product Count & Filter / Sort Action Bar ── */}
      <section className="shop-controls-bar">
        <div className="shop-product-count">
          {isLoading || isPending ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#8E6EA8" }}>
              <Loader2 size={14} className="animate-spin" /> Filtering...
            </span>
          ) : (
            <>
              <strong>{products.length}</strong> {products.length === 1 ? "Product" : "Products"}
            </>
          )}
        </div>

        <div className="shop-controls-actions">
          <button
            type="button"
            className="shop-control-btn"
            onClick={() => setFilterModalOpen(true)}
            aria-label="Open filter modal"
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span
                style={{
                  background: "#8E6EA8",
                  color: "#FFFFFF",
                  borderRadius: "999px",
                  fontSize: "0.65rem",
                  padding: "1px 6px",
                  fontWeight: 700
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="shop-control-btn"
            onClick={() => setSortModalOpen(true)}
            aria-label="Open sort modal"
          >
            <ArrowUpDown size={14} />
            <span>
              {sortBy === "price-asc"
                ? "Price: Low to High"
                : sortBy === "price-desc"
                ? "Price: High to Low"
                : sortBy === "newest"
                ? "Newest"
                : sortBy === "name-asc"
                ? "A - Z"
                : "Sort"}
            </span>
          </button>
        </div>
      </section>

      {/* ── Active Filter Tags Row ── */}
      {activeFiltersCount > 0 && (
        <section className="active-filter-tags-row" style={{ padding: "0 16px 12px", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", marginRight: 4 }}>
            Active:
          </span>

          {!fixedCategory && selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                applyFilters({ category: "all" });
              }}
              className="active-filter-tag"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#FAF8FD",
                border: "1px solid #E4D9F0",
                color: "#7C5999",
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Category: {categoryItems.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
              <X size={12} />
            </button>
          )}

          {selectedSize !== "all" && (
            <button
              type="button"
              onClick={() => {
                setSelectedSize("all");
                applyFilters({ size: "all" });
              }}
              className="active-filter-tag"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#FAF8FD",
                border: "1px solid #E4D9F0",
                color: "#7C5999",
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Size: {selectedSize}
              <X size={12} />
            </button>
          )}

          {selectedColor !== "all" && (
            <button
              type="button"
              onClick={() => {
                setSelectedColor("all");
                applyFilters({ color: "all" });
              }}
              className="active-filter-tag"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#FAF8FD",
                border: "1px solid #E4D9F0",
                color: "#7C5999",
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Color: {selectedColor}
              <X size={12} />
            </button>
          )}

          {(typeof minPrice === "number" || typeof maxPrice === "number") && (
            <button
              type="button"
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                applyFilters({ minP: "", maxP: "" });
              }}
              className="active-filter-tag"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#FAF8FD",
                border: "1px solid #E4D9F0",
                color: "#7C5999",
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Price: ₹{minPrice || 0} - ₹{maxPrice || "Max"}
              <X size={12} />
            </button>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            style={{
              background: "none",
              border: "none",
              color: "#DC2626",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
              marginLeft: 4,
              textDecoration: "underline"
            }}
          >
            Reset All
          </button>
        </section>
      )}

      {/* ── 4. Responsive Product Grid ── */}
      <section className="shop-grid-section">
        {products.length > 0 ? (
          <div className="mobile-product-grid">
            {products.map((product) => (
              <ProductCard key={product.id || product.productId || product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="shop-empty-state" style={{ textAlign: "center", padding: "60px 20px", background: "#FFFFFF", borderRadius: 16, border: "1px dashed #E0D7C9" }}>
            <span style={{ fontSize: "2.8rem", display: "block", marginBottom: 12 }}>🌿</span>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h3)", color: "var(--nilasa-indigo)", margin: "0 0 8px" }}>
              No garments match your filters
            </h3>
            <p style={{ color: "var(--ink-muted)", fontSize: "var(--fs-body-base)", maxWidth: 440, margin: "0 auto 20px" }}>
              Try broadening your size, color, or price filters to discover handcrafted ethnic pieces.
            </p>
            <button
              type="button"
              onClick={handleClearAll}
              className="button button--gold"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <RotateCcw size={15} /> Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* ── 5. Interactive Filter Bottom Drawer (Backend Powered) ── */}
      {filterModalOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setFilterModalOpen(false)}>
          <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "85vh" }}>
            <div className="mobile-drawer-header">
              <h3>Filter Garments</h3>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="mobile-drawer-close"
                aria-label="Close filter drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Category Filter (Only on general /shop page) */}
              {!fixedCategory && (
                <div className="drawer-filter-group">
                  <span className="drawer-filter-title">Category</span>
                  <div className="drawer-chips-grid">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={`drawer-chip ${selectedCategory === "all" ? "selected" : ""}`}
                    >
                      <span>All Categories</span>
                      {selectedCategory === "all" && <Check size={13} />}
                    </button>
                    {categoryItems.map((cat) => (
                      <button
                        key={cat.categoryId || cat.slug}
                        type="button"
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`drawer-chip ${selectedCategory.toLowerCase() === cat.slug.toLowerCase() ? "selected" : ""}`}
                      >
                        <span>{cat.name}</span>
                        {cat.productCount > 0 && <span style={{ opacity: 0.7, fontSize: "0.72rem" }}>({cat.productCount})</span>}
                        {selectedCategory.toLowerCase() === cat.slug.toLowerCase() && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Filter (Backend API) */}
              <div className="drawer-filter-group">
                <span className="drawer-filter-title">Size</span>
                <div className="drawer-chips-grid">
                  <button
                    type="button"
                    onClick={() => setSelectedSize("all")}
                    className={`drawer-chip ${selectedSize === "all" ? "selected" : ""}`}
                  >
                    <span>All Sizes</span>
                    {selectedSize === "all" && <Check size={13} />}
                  </button>
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`drawer-chip ${selectedSize === sz ? "selected" : ""}`}
                    >
                      <span>{sz}</span>
                      {selectedSize === sz && <Check size={13} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter (Backend API with Visual Swatches) */}
              <div className="drawer-filter-group">
                <span className="drawer-filter-title">Color</span>
                <div className="drawer-chips-grid">
                  <button
                    type="button"
                    onClick={() => setSelectedColor("all")}
                    className={`drawer-chip ${selectedColor === "all" ? "selected" : ""}`}
                  >
                    <span>All Colors</span>
                    {selectedColor === "all" && <Check size={13} />}
                  </button>
                  {availableColors.map((clr) => (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => setSelectedColor(clr)}
                      className={`drawer-chip ${selectedColor === clr ? "selected" : ""}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: getColorHex(clr),
                          border: "1px solid rgba(0,0,0,0.15)",
                          display: "inline-block"
                        }}
                      />
                      <span>{clr}</span>
                      {selectedColor === clr && <Check size={13} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter (Backend API) */}
              <div className="drawer-filter-group">
                <span className="drawer-filter-title">Price Range (₹)</span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "#64748B", marginBottom: 4 }}>
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder={filters?.minPrice ? `₹${filters.minPrice}` : "₹ Min"}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                        fontSize: "0.85rem",
                        fontFamily: "var(--font-mono)"
                      }}
                    />
                  </div>
                  <span style={{ color: "#94A3B8", marginTop: 18 }}>–</span>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "#64748B", marginBottom: 4 }}>
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder={filters?.maxPrice ? `₹${filters.maxPrice}` : "₹ Max"}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                        fontSize: "0.85rem",
                        fontFamily: "var(--font-mono)"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mobile-drawer-footer">
              <button
                type="button"
                onClick={handleClearAll}
                className="drawer-btn-secondary"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterModalOpen(false);
                  applyFilters({});
                }}
                className="drawer-btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Interactive Sort Bottom Drawer (Backend Supported) ── */}
      {sortModalOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setSortModalOpen(false)}>
          <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <h3>Sort By</h3>
              <button
                type="button"
                onClick={() => setSortModalOpen(false)}
                className="mobile-drawer-close"
                aria-label="Close sort drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              <div className="drawer-sort-options">
                {[
                  { id: "featured", label: "Featured & Bestsellers" },
                  { id: "newest", label: "Newest Arrivals" },
                  { id: "price-asc", label: "Price: Low to High" },
                  { id: "price-desc", label: "Price: High to Low" },
                  { id: "name-asc", label: "Product Name (A - Z)" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSortChange(opt.id)}
                    className={`drawer-sort-option ${sortBy === opt.id ? "selected" : ""}`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check size={16} color="#354232" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopClient;
