"use client";

import { useEffect, useState, useTransition, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Product, Category, FilterOptions, ProductFilterParams } from "@/lib/types";
import { fetchProductsWithFilters, fetchProductsPaged, fetchProductFilters } from "@/lib/dotnet-backend";
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
  const collectionParam = searchParams.get("collection") || "";
  const tagParam = searchParams.get("tag") || "";
  const sizeParam = searchParams.get("size") || "all";
  const colorParam = searchParams.get("color") || "all";
  const minPriceParam = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPriceParam = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const sortParam = searchParams.get("sortBy") || "featured";

  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filters, setFilters] = useState<FilterOptions | null>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(initialProducts.length);
  const [hasMore, setHasMore] = useState<boolean>(initialProducts.length >= 24);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Active filter selections
  const [selectedCategory, setSelectedCategory] = useState<string>(fixedCategory || catParam || "all");
  const [selectedCollection, setSelectedCollection] = useState<string>(collectionParam);
  const [selectedTag, setSelectedTag] = useState<string>(tagParam);
  const [selectedSize, setSelectedSize] = useState<string>(sizeParam);
  const [selectedColor, setSelectedColor] = useState<string>(colorParam);
  const [minPrice, setMinPrice] = useState<number | "">(minPriceParam ?? "");
  const [maxPrice, setMaxPrice] = useState<number | "">(maxPriceParam ?? "");
  const [sortBy, setSortBy] = useState<string>(sortParam);

  // Modals
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);

  const initialMounted = useRef(false);

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
    setSelectedCollection(collectionParam);
    setSelectedTag(tagParam);
    setSelectedSize(sizeParam);
    setSelectedColor(colorParam);
    setMinPrice(minPriceParam ?? "");
    setMaxPrice(maxPriceParam ?? "");
    setSortBy(sortParam);
  }, [catParam, collectionParam, tagParam, sizeParam, colorParam, minPriceParam, maxPriceParam, sortParam, fixedCategory]);

  // Master fetch function querying backend filter API with page 1
  const applyFilters = useCallback(
    async (params: {
      category?: string;
      collection?: string;
      tag?: string;
      size?: string;
      color?: string;
      minP?: number | "";
      maxP?: number | "";
      sort?: string;
      search?: string;
    }) => {
      setIsLoading(true);
      const cat = params.category !== undefined ? params.category : selectedCategory;
      const col = params.collection !== undefined ? params.collection : selectedCollection;
      const tg = params.tag !== undefined ? params.tag : selectedTag;
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
        collection: col || undefined,
        tag: tg || undefined,
        size: sz !== "all" ? sz : undefined,
        color: clr !== "all" ? clr : undefined,
        minPrice: typeof minP === "number" ? minP : undefined,
        maxPrice: typeof maxP === "number" ? maxP : undefined,
        sortBy: srt !== "featured" ? srt : undefined
      };

      try {
        const pagedRes = await fetchProductsPaged(queryParams, 1, 24);
        setProducts(pagedRes.items);
        setCurrentPage(1);
        setTotalCount(pagedRes.totalCount ?? pagedRes.items.length);
        setHasMore(pagedRes.hasMore);
      } catch {
        // keep previous state
      } finally {
        setIsLoading(false);
      }

      // Update URL query string without page reload
      const newUrlParams = new URLSearchParams();
      if (srch) newUrlParams.set("q", srch);
      if (col) newUrlParams.set("collection", col);
      if (tg) newUrlParams.set("tag", tg);
      if (sz && sz !== "all") newUrlParams.set("size", sz);
      if (clr && clr !== "all") newUrlParams.set("color", clr);
      if (typeof minP === "number") newUrlParams.set("minPrice", minP.toString());
      if (typeof maxP === "number") newUrlParams.set("maxPrice", maxP.toString());
      if (srt && srt !== "featured") newUrlParams.set("sortBy", srt);

      const qs = newUrlParams.toString();
      const basePath = cat && cat !== "all" ? `/category/${cat}` : "/shop";
      startTransition(() => {
        router.push(`${basePath}${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    },
    [selectedCategory, selectedCollection, selectedTag, selectedSize, selectedColor, minPrice, maxPrice, sortBy, qParam, filters, categories, router, fixedCategory]
  );

  // Sync products on initial mount if URL has search/filter params
  useEffect(() => {
    const hasInitialFilters =
      (!fixedCategory && catParam && catParam !== "all") ||
      collectionParam ||
      tagParam ||
      (sizeParam && sizeParam !== "all") ||
      (colorParam && colorParam !== "all") ||
      minPriceParam !== null ||
      maxPriceParam !== null ||
      (sortParam && sortParam !== "featured") ||
      qParam;

    if (!initialMounted.current) {
      initialMounted.current = true;
      if (hasInitialFilters) {
        applyFilters({
          category: fixedCategory || catParam || "all",
          collection: collectionParam,
          tag: tagParam,
          size: sizeParam,
          color: colorParam,
          minP: minPriceParam ?? "",
          maxP: maxPriceParam ?? "",
          sort: sortParam,
          search: qParam
        });
      }
    }
  }, [
    catParam,
    collectionParam,
    tagParam,
    sizeParam,
    colorParam,
    minPriceParam,
    maxPriceParam,
    sortParam,
    qParam,
    fixedCategory,
    applyFilters
  ]);

  // Load next batch of products for large 10,000+ catalogs
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    let catId: number | undefined = undefined;
    if (selectedCategory && selectedCategory !== "all") {
      const found =
        filters?.categories.find((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase()) ||
        categories.find((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase() || c.categoryId.toString() === selectedCategory);
      if (found) catId = found.categoryId;
    }

    const queryParams: ProductFilterParams = {
      search: qParam || undefined,
      categoryId: catId,
      collection: selectedCollection || undefined,
      tag: selectedTag || undefined,
      size: selectedSize !== "all" ? selectedSize : undefined,
      color: selectedColor !== "all" ? selectedColor : undefined,
      minPrice: typeof minPrice === "number" ? minPrice : undefined,
      maxPrice: typeof maxPrice === "number" ? maxPrice : undefined,
      sortBy: sortBy !== "featured" ? sortBy : undefined
    };

    try {
      const pagedRes = await fetchProductsPaged(queryParams, nextPage, 24);
      if (pagedRes.items.length > 0) {
        setProducts((prev) => {
          const seen = new Set(prev.map((p) => p.productId || p.id || p.slug));
          const fresh = pagedRes.items.filter((p) => !seen.has(p.productId || p.id || p.slug));
          return [...prev, ...fresh];
        });
        setCurrentPage(nextPage);
        setTotalCount(pagedRes.totalCount ?? (products.length + pagedRes.items.length));
        setHasMore(pagedRes.hasMore);
      } else {
        setHasMore(false);
      }
    } catch {
      // keep state
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Trigger query when pills or sort change
  const handlePillClick = (catSlug: string) => {
    setSelectedCategory(catSlug);
    applyFilters({ category: catSlug });
  };

  const handleCollectionClick = (colName: string) => {
    const nextCol = selectedCollection === colName ? "" : colName;
    setSelectedCollection(nextCol);
    applyFilters({ collection: nextCol });
  };

  const handleTagClick = (tag: string) => {
    const nextTag = selectedTag === tag ? "" : tag;
    setSelectedTag(nextTag);
    applyFilters({ tag: nextTag });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setSortModalOpen(false);
    applyFilters({ sort: newSort });
  };

  const handleClearAll = () => {
    setSelectedCategory("all");
    setSelectedCollection("");
    setSelectedTag("");
    setSelectedSize("all");
    setSelectedColor("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("featured");
    setFilterModalOpen(false);
    applyFilters({
      category: "all",
      collection: "",
      tag: "",
      size: "all",
      color: "all",
      minP: "",
      maxP: "",
      sort: "featured",
      search: ""
    });
  };

  // Derive deduplicated categories list (combining backend filter data + categories fallback)
  const categoryItems = useMemo(() => {
    const source = (filters?.categories && filters.categories.length > 0)
      ? filters.categories
      : categories.map((c) => ({
          categoryId: c.categoryId || (c as any).id || 0,
          name: c.name,
          slug: c.slug,
          productCount: 0
        }));

    const map = new Map<string, { categoryId: number; name: string; slug: string; productCount: number }>();
    for (const cat of source) {
      const key = cat.name.toLowerCase().trim();
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.productCount = Math.max(existing.productCount, cat.productCount);
        if (cat.slug === "suits" || cat.slug === "kurtis" || cat.slug === "co-ord-sets") {
          existing.slug = cat.slug;
          existing.categoryId = cat.categoryId;
        }
      } else {
        map.set(key, { ...cat });
      }
    }
    return Array.from(map.values());
  }, [filters, categories]);

  const availableSizes = filters?.sizes?.length
    ? filters.sizes
    : ["S", "M", "L", "XL", "XXL", "Free Size"];

  const availableColors = filters?.colors?.length
    ? filters.colors
    : ["Lavender", "Olive", "Gold", "Ivory", "Navy", "Rose", "Emerald"];

  const popularTags = ["Festive", "Silk", "Handloom", "Party", "Zari", "Embroidery", "Summer", "Cotton"];

  const activeFiltersCount =
    (!fixedCategory && selectedCategory !== "all" ? 1 : 0) +
    (selectedCollection ? 1 : 0) +
    (selectedTag ? 1 : 0) +
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
                  : selectedCollection === "bestsellers"
                  ? "Best Sellers"
                  : selectedCollection === "new"
                  ? "New Arrivals"
                  : selectedCollection === "featured"
                  ? "Featured Creations"
                  : selectedTag
                  ? `${selectedTag} Edit`
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

      {/* ── 2. Curated Collection Tabs Row ── */}
      {!fixedCategory && (
        <div style={{ padding: "0 16px 8px", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { id: "", label: "All Garments" },
            { id: "bestsellers", label: "🔥 Best Sellers" },
            { id: "new", label: "✨ New Arrivals" },
            { id: "featured", label: "🌟 Featured" }
          ].map((col) => {
            const isSelected = selectedCollection === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => handleCollectionClick(col.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  border: isSelected ? "1px solid var(--nilasa-indigo)" : "1px solid rgba(198, 146, 68, 0.25)",
                  backgroundColor: isSelected ? "var(--nilasa-indigo)" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "var(--ink-primary)",
                  boxShadow: isSelected ? "0 2px 8px rgba(32, 43, 69, 0.15)" : "none",
                  transition: "all 0.18s ease"
                }}
              >
                {col.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── 3. Dynamic Category Filter Pills Row ── */}
      {!fixedCategory && categoryItems.length > 0 && (
        <nav className="shop-pills-row" aria-label="Category Filters">
          <div className="shop-pills-scroll">
            <button
              type="button"
              onClick={() => handlePillClick("all")}
              className={`shop-pill-chip ${selectedCategory === "all" ? "active" : ""}`}
            >
              <span>All Categories</span>
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

      {/* ── 4. Product Count & Filter / Sort Action Bar ── */}
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

          {selectedCollection && (
            <button
              type="button"
              onClick={() => {
                setSelectedCollection("");
                applyFilters({ collection: "" });
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
              Collection: {selectedCollection === "bestsellers" ? "Best Sellers" : selectedCollection === "new" ? "New Arrivals" : selectedCollection}
              <X size={12} />
            </button>
          )}

          {selectedTag && (
            <button
              type="button"
              onClick={() => {
                setSelectedTag("");
                applyFilters({ tag: "" });
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
              Tag: {selectedTag}
              <X size={12} />
            </button>
          )}

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
          <>
            <div className="mobile-product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id || product.productId || product.slug}
                  product={product}
                  activeColor={selectedColor}
                  activeSize={selectedSize}
                />
              ))}
            </div>

            {/* Pagination & Load More Controls */}
            <div style={{ textAlign: "center", marginTop: "40px", marginBottom: "20px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: "12px" }}>
                Showing {products.length} of {totalCount || products.length} designs
              </p>
              {hasMore ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="tabbed-showcase-cta"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: isLoadingMore ? "not-allowed" : "pointer",
                    opacity: isLoadingMore ? 0.7 : 1
                  }}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={16} className="spin" style={{ animation: "spin 1s linear infinite" }} />
                      <span>Loading More Creations...</span>
                    </>
                  ) : (
                    <span>Load More Products</span>
                  )}
                </button>
              ) : products.length > 24 ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--ink-muted)", fontSize: "0.85rem" }}>
                  <Check size={16} color="var(--nilasa-gold, #D4B258)" />
                  <span>You have reached the end of the collection.</span>
                </div>
              ) : null}
            </div>
          </>
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
              {/* Category Filter */}
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

              {/* Curated Collection Filter (Backend API) */}
              <div className="drawer-filter-group">
                <span className="drawer-filter-title">Curated Collection</span>
                <div className="drawer-chips-grid">
                  {[
                    { id: "", label: "All Garments" },
                    { id: "bestsellers", label: "🔥 Best Sellers" },
                    { id: "new", label: "✨ New Arrivals" },
                    { id: "featured", label: "🌟 Featured Creations" }
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedCollection(col.id)}
                      className={`drawer-chip ${selectedCollection === col.id ? "selected" : ""}`}
                    >
                      <span>{col.label}</span>
                      {selectedCollection === col.id && <Check size={13} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag / Fabric / Theme Filter (Backend API) */}
              <div className="drawer-filter-group">
                <span className="drawer-filter-title">Popular Tags & Edits</span>
                <div className="drawer-chips-grid">
                  <button
                    type="button"
                    onClick={() => setSelectedTag("")}
                    className={`drawer-chip ${!selectedTag ? "selected" : ""}`}
                  >
                    <span>All Tags</span>
                    {!selectedTag && <Check size={13} />}
                  </button>
                  {popularTags.map((tg) => (
                    <button
                      key={tg}
                      type="button"
                      onClick={() => setSelectedTag(tg)}
                      className={`drawer-chip ${selectedTag.toLowerCase() === tg.toLowerCase() ? "selected" : ""}`}
                    >
                      <span>{tg}</span>
                      {selectedTag.toLowerCase() === tg.toLowerCase() && <Check size={13} />}
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
