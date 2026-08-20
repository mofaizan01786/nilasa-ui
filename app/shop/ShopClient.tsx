"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Product, Category, FilterOptions, ProductFilterParams } from "@/lib/types";
import { fetchProductsWithFilters, fetchProductFilters } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import {
  SlidersHorizontal,
  ChevronDown,
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

const FABRIC_OPTIONS = ["Cotton", "Chanderi Silk", "Organza", "Linen", "Georgette", "Mulmul"];

export function ShopClient({
  initialProducts = [],
  categories = [],
  initialFilters = null,
  categoryTitle,
  categoryDesc,
  fixedCategory
}: {
  initialProducts?: Product[];
  categories?: Category[];
  initialFilters?: FilterOptions | null;
  categoryTitle?: string;
  categoryDesc?: string;
  fixedCategory?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & URL parameters
  const qParam = searchParams.get("q") || searchParams.get("search") || "";
  const catParam = fixedCategory || searchParams.get("category") || searchParams.get("type") || "";
  const sizeParam = searchParams.get("size") || "all";
  const colorParam = searchParams.get("color") || "all";
  const fabricParam = searchParams.get("fabric") || "all";
  const minPriceParam = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPriceParam = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const sortParam = searchParams.get("sortBy") || "featured";

  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filters, setFilters] = useState<FilterOptions | null>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  // Active filter selections
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam || "all");
  const [selectedSize, setSelectedSize] = useState<string>(sizeParam);
  const [selectedColor, setSelectedColor] = useState<string>(colorParam);
  const [selectedFabric, setSelectedFabric] = useState<string>(fabricParam);
  const [minPrice, setMinPrice] = useState<number | "">(minPriceParam ?? "");
  const [maxPrice, setMaxPrice] = useState<number | "">(maxPriceParam ?? "");
  const [sortBy, setSortBy] = useState<string>(sortParam);

  // Modals
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (filterDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterDrawerOpen]);

  // Load available filter options
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
    setSelectedFabric(fabricParam);
    setMinPrice(minPriceParam ?? "");
    setMaxPrice(maxPriceParam ?? "");
    setSortBy(sortParam);
  }, [fixedCategory, catParam, sizeParam, colorParam, fabricParam, minPriceParam, maxPriceParam, sortParam]);

  // Filter query runner
  const applyFilters = useCallback(
    async (params: {
      category?: string;
      size?: string;
      color?: string;
      fabric?: string;
      minP?: number | "";
      maxP?: number | "";
      sort?: string;
      search?: string;
    }) => {
      setIsLoading(true);
      const cat = fixedCategory || (params.category !== undefined ? params.category : selectedCategory);
      const sz = params.size !== undefined ? params.size : selectedSize;
      const clr = params.color !== undefined ? params.color : selectedColor;
      const fbr = params.fabric !== undefined ? params.fabric : selectedFabric;
      const minP = params.minP !== undefined ? params.minP : minPrice;
      const maxP = params.maxP !== undefined ? params.maxP : maxPrice;
      const srt = params.sort !== undefined ? params.sort : sortBy;
      const srch = params.search !== undefined ? params.search : qParam;

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
        let result = await fetchProductsWithFilters(queryParams);
        if (fbr && fbr !== "all") {
          result = result.filter((p) =>
            p.fabric?.toLowerCase().includes(fbr.toLowerCase()) ||
            p.name.toLowerCase().includes(fbr.toLowerCase())
          );
        }
        setProducts(result);
      } catch {
        // preserve
      } finally {
        setIsLoading(false);
      }

      // Update URL search parameters
      const newUrlParams = new URLSearchParams();
      if (srch) newUrlParams.set("q", srch);
      if (!fixedCategory && cat && cat !== "all") newUrlParams.set("category", cat);
      if (sz && sz !== "all") newUrlParams.set("size", sz);
      if (clr && clr !== "all") newUrlParams.set("color", clr);
      if (fbr && fbr !== "all") newUrlParams.set("fabric", fbr);
      if (typeof minP === "number") newUrlParams.set("minPrice", minP.toString());
      if (typeof maxP === "number") newUrlParams.set("maxPrice", maxP.toString());
      if (srt && srt !== "featured") newUrlParams.set("sortBy", srt);

      const qs = newUrlParams.toString();
      const basePath = fixedCategory ? `/category/${fixedCategory}` : "/shop";
      startTransition(() => {
        router.push(`${basePath}${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    },
    [fixedCategory, selectedCategory, selectedSize, selectedColor, selectedFabric, minPrice, maxPrice, sortBy, qParam, filters, categories, router]
  );

  const handleClearAll = () => {
    setSelectedSize("all");
    setSelectedColor("all");
    setSelectedFabric("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("featured");
    if (!fixedCategory) setSelectedCategory("all");
    applyFilters({
      category: fixedCategory || "all",
      size: "all",
      color: "all",
      fabric: "all",
      minP: "",
      maxP: "",
      sort: "featured"
    });
  };

  const activeFiltersCount =
    (!fixedCategory && selectedCategory !== "all" ? 1 : 0) +
    (selectedSize !== "all" ? 1 : 0) +
    (selectedColor !== "all" ? 1 : 0) +
    (selectedFabric !== "all" ? 1 : 0) +
    (minPrice !== "" || maxPrice !== "" ? 1 : 0);

  const displayTitle = categoryTitle || (selectedCategory !== "all" ? selectedCategory.toUpperCase() : "ALL COLLECTIONS");
  const displayDesc =
    categoryDesc ||
    "The perfect look for a modern woman - discover the collection of handcrafted ethnic pieces.";

  const availableSizes = filters?.sizes?.length ? filters.sizes : ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
  const availableColors = filters?.colors?.length ? filters.colors : ["Sage", "Olive", "Rose", "Navy", "Ivory", "Indigo", "Lavender"];

  const sortLabel =
    sortBy === "price-asc"
      ? "Price, low to high"
      : sortBy === "price-desc"
      ? "Price, high to low"
      : sortBy === "newest"
      ? "Date, new to old"
      : sortBy === "name-asc"
      ? "Alphabetically, A-Z"
      : "Featured";

  return (
    <div className="nilasa-collection-page shell">
      {/* 1. Nilasa Signature Centered Collection Header */}
      <header className="nilasa-collection-header">
        <h1 className="nilasa-collection-header__title">
          {displayTitle}
        </h1>
        <p className="nilasa-collection-header__desc">
          {displayDesc}
        </p>
      </header>

      {/* 2. Nilasa Collection Controls Bar */}
      <div className="nilasa-collection-bar">
        {/* Left: Product Count */}
        <div className="nilasa-collection-bar__count">
          <span>{isLoading ? "Updating..." : `${products.length} products`}</span>
        </div>

        {/* Right: Filter Trigger & Sort By */}
        <div className="nilasa-collection-bar__controls">
          {/* Filter Button */}
          <button
            type="button"
            className={`nilasa-filter-btn ${activeFiltersCount > 0 ? "has-filters" : ""}`}
            onClick={() => setFilterDrawerOpen(true)}
            aria-label="Open filter options"
          >
            <SlidersHorizontal size={15} />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="nilasa-filter-count-badge">{activeFiltersCount}</span>
            )}
          </button>

          {/* Sort By Dropdown */}
          <div className="nilasa-sort-wrap">
            <button
              type="button"
              className="nilasa-sort-btn"
              onClick={() => setSortDropdownOpen((prev) => !prev)}
              aria-label="Sort products"
            >
              <span>Sort by: {sortLabel}</span>
              <ChevronDown size={14} />
            </button>

            {sortDropdownOpen && (
              <div className="nilasa-sort-dropdown" onMouseLeave={() => setSortDropdownOpen(false)}>
                {[
                  { id: "featured", label: "Featured" },
                  { id: "newest", label: "Date, new to old" },
                  { id: "price-asc", label: "Price, low to high" },
                  { id: "price-desc", label: "Price, high to low" },
                  { id: "name-asc", label: "Alphabetically, A-Z" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id);
                      setSortDropdownOpen(false);
                      applyFilters({ sort: opt.id });
                    }}
                    className={`nilasa-sort-item ${sortBy === opt.id ? "active" : ""}`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Active Filters Strip */}
      {activeFiltersCount > 0 && (
        <div className="nilasa-active-filters-strip">
          <span className="nilasa-active-label">Active:</span>

          {selectedFabric !== "all" && (
            <button
              type="button"
              onClick={() => {
                setSelectedFabric("all");
                applyFilters({ fabric: "all" });
              }}
              className="nilasa-active-chip"
            >
              <span>Fabric: {selectedFabric}</span>
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
              className="nilasa-active-chip"
            >
              <span>Size: {selectedSize}</span>
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
              className="nilasa-active-chip"
            >
              <span>Color: {selectedColor}</span>
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
              className="nilasa-active-chip"
            >
              <span>Price: ₹{minPrice || 0} - ₹{maxPrice || "Max"}</span>
              <X size={12} />
            </button>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="nilasa-clear-all-link"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 4. Nilasa 4-Column Product Grid */}
      <div className="nilasa-products-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id || product.productId || product.slug} product={product} />
          ))
        ) : (
          <div className="nilasa-empty-grid">
            <h3>No products found</h3>
            <p>Try adjusting your search or filter options to discover other pieces.</p>
            <button type="button" onClick={handleClearAll} className="nilasa-btn-primary">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Sleek Slide-Out Filter Drawer (Portaled directly to document.body) */}
      {filterDrawerOpen && mounted && createPortal(
        <div className="nilasa-drawer-backdrop" onClick={() => setFilterDrawerOpen(false)}>
          <aside className="nilasa-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="nilasa-drawer__head">
              <h3>Filter</h3>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="nilasa-drawer__close"
                aria-label="Close filter drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="nilasa-drawer__body">
              {/* Fabric Filter */}
              <div className="nilasa-drawer-group">
                <span className="nilasa-drawer-title">Fabric / Material</span>
                <div className="nilasa-pills-row">
                  {FABRIC_OPTIONS.map((fbr) => (
                    <button
                      key={fbr}
                      type="button"
                      onClick={() => {
                        const next = selectedFabric.toLowerCase() === fbr.toLowerCase() ? "all" : fbr;
                        setSelectedFabric(next);
                      }}
                      className={`nilasa-pill ${selectedFabric.toLowerCase() === fbr.toLowerCase() ? "active" : ""}`}
                    >
                      <span>{fbr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="nilasa-drawer-group">
                <span className="nilasa-drawer-title">Size</span>
                <div className="nilasa-pills-row">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        const next = selectedSize === sz ? "all" : sz;
                        setSelectedSize(next);
                      }}
                      className={`nilasa-pill ${selectedSize === sz ? "active" : ""}`}
                    >
                      <span>{sz}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="nilasa-drawer-group">
                <span className="nilasa-drawer-title">Color</span>
                <div className="nilasa-color-grid">
                  {availableColors.map((clr) => (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => {
                        const next = selectedColor.toLowerCase() === clr.toLowerCase() ? "all" : clr;
                        setSelectedColor(next);
                      }}
                      className={`nilasa-color-chip ${selectedColor.toLowerCase() === clr.toLowerCase() ? "active" : ""}`}
                    >
                      <span className="dot" style={{ backgroundColor: getColorHex(clr) }} />
                      <span>{clr}</span>
                      {selectedColor.toLowerCase() === clr.toLowerCase() && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="nilasa-drawer-group">
                <span className="nilasa-drawer-title">Price Range (₹)</span>
                <div className="nilasa-price-inputs">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                  />
                  <span>–</span>
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                  />
                </div>
              </div>
            </div>

            <div className="nilasa-drawer__foot">
              <button
                type="button"
                onClick={() => {
                  handleClearAll();
                  setFilterDrawerOpen(false);
                }}
                className="nilasa-drawer-clear"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilters({});
                  setFilterDrawerOpen(false);
                }}
                className="nilasa-drawer-apply"
              >
                Apply Filters
              </button>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ShopClient;
