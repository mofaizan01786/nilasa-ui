"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Product, Category } from "@/lib/types";
import { fetchPublishedProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  Sparkles,
  Search
} from "lucide-react";

const PRESET_PILLS = [
  { id: "all", label: "All", queryParam: "" },
  { id: "new", label: "New Arrivals", queryParam: "new" },
  { id: "suits", label: "Suits", queryParam: "suits" },
  { id: "anarkalis", label: "Anarkalis", queryParam: "anarkali" },
  { id: "kurtis", label: "Kurtis", queryParam: "kurtis" },
  { id: "coords", label: "Co-ords", queryParam: "co-ord-sets" },
  { id: "lehengas", label: "Lehengas", queryParam: "lehengas" },
  { id: "dupattas", label: "Dupattas", queryParam: "dupattas" }
];

export function ShopClient({
  initialProducts,
  categories
}: {
  initialProducts?: Product[];
  categories?: Category[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || searchParams.get("type") || "";

  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts || []);
  const [activePill, setActivePill] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [selectedFabric, setSelectedFabric] = useState<string>("all");

  // Modals
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);

  useEffect(() => {
    fetchPublishedProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  // Sync active pill with search params
  useEffect(() => {
    if (!categoryParam && !q) {
      setActivePill("all");
    } else {
      const match = PRESET_PILLS.find(
        (p) => p.queryParam && (categoryParam.toLowerCase().includes(p.queryParam) || q.toLowerCase().includes(p.queryParam))
      );
      setActivePill(match ? match.id : "all");
    }
  }, [categoryParam, q]);

  // Filter & Sort computation
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // 1. Search Query
    if (q.trim()) {
      const term = q.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.categorySlug?.toLowerCase().includes(term)
      );
    }

    // 2. Category / Pill filter
    if (activePill !== "all") {
      const pillObj = PRESET_PILLS.find((p) => p.id === activePill);
      if (pillObj && pillObj.queryParam) {
        const pTerm = pillObj.queryParam.toLowerCase();
        list = list.filter(
          (p) =>
            p.categorySlug?.toLowerCase().includes(pTerm) ||
            p.name.toLowerCase().includes(pTerm) ||
            p.categoryName?.toLowerCase().includes(pTerm) ||
            (pTerm === "new" && (p.badge?.toLowerCase().includes("new") || p.status === "Published"))
        );
      }
    } else if (categoryParam) {
      const cTerm = categoryParam.toLowerCase();
      list = list.filter(
        (p) =>
          p.categorySlug?.toLowerCase() === cTerm ||
          p.categoryName?.toLowerCase().includes(cTerm) ||
          p.name.toLowerCase().includes(cTerm)
      );
    }

    // 3. Fabric filter
    if (selectedFabric !== "all") {
      list = list.filter((p) =>
        p.fabric?.toLowerCase().includes(selectedFabric.toLowerCase()) ||
        p.description?.toLowerCase().includes(selectedFabric.toLowerCase())
      );
    }

    // 4. Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === "newest") {
      list.sort((a, b) => (b.productId || 0) - (a.productId || 0));
    }

    return list;
  }, [allProducts, q, activePill, categoryParam, selectedFabric, sortBy]);

  const handlePillClick = (pillId: string, param: string) => {
    setActivePill(pillId);
    if (pillId === "all") {
      router.push("/shop", { scroll: false });
    } else {
      router.push(`/shop?category=${encodeURIComponent(param)}`, { scroll: false });
    }
  };

  return (
    <div className="mobile-shop-experience">
      {/* ── 1. Hero / Shop Title Banner with Lavender Botanical Illustration ── */}
      <section className="shop-hero-botanical">
        <div className="shop-hero-content">
          <span className="shop-kicker">SHOP</span>
          <h1 className="shop-hero-title">
            Indian womenswear,<br />thoughtfully handcrafted.
          </h1>
          <p className="shop-hero-subtitle">
            Timeless styles. Modern souls.
          </p>
        </div>

        {/* Decorative Botanical Lavender SVG Sprigs Illustration */}
        <div className="shop-hero-botanical-art" aria-hidden="true">
          <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="botanical-svg">
            <g opacity="0.85">
              {/* Stem 1 */}
              <path d="M60 230 C 65 160, 95 100, 110 30" stroke="#7A8B6F" strokeWidth="2.2" strokeLinecap="round" />
              {/* Stem 2 */}
              <path d="M110 230 C 120 150, 145 90, 160 20" stroke="#6F8364" strokeWidth="2.2" strokeLinecap="round" />
              {/* Leaves */}
              <path d="M65 170 C 50 160, 45 145, 55 140 C 65 145, 70 160, 65 170 Z" fill="#92A387" />
              <path d="M85 130 C 100 120, 105 105, 95 100 C 85 105, 80 120, 85 130 Z" fill="#92A387" />
              <path d="M125 140 C 140 130, 145 115, 135 110 C 125 115, 120 130, 125 140 Z" fill="#849978" />
              {/* Lavender Flower Buds Sprigs */}
              <ellipse cx="108" cy="45" rx="7" ry="4" fill="#9D84B7" transform="rotate(-20 108 45)" />
              <ellipse cx="114" cy="40" rx="7" ry="4" fill="#B39DCB" transform="rotate(20 114 40)" />
              <ellipse cx="109" cy="32" rx="6" ry="3.5" fill="#8C71A8" transform="rotate(-15 109 32)" />
              <ellipse cx="113" cy="27" rx="6" ry="3.5" fill="#A58EC1" transform="rotate(25 113 27)" />
              <ellipse cx="111" cy="20" rx="5" ry="3" fill="#8C71A8" />

              <ellipse cx="158" cy="35" rx="7" ry="4" fill="#8C71A8" transform="rotate(-20 158 35)" />
              <ellipse cx="164" cy="30" rx="7" ry="4" fill="#A58EC1" transform="rotate(20 164 30)" />
              <ellipse cx="159" cy="22" rx="6" ry="3.5" fill="#9D84B7" transform="rotate(-15 159 22)" />
              <ellipse cx="163" cy="17" rx="6" ry="3.5" fill="#B39DCB" transform="rotate(25 163 17)" />
              <ellipse cx="161" cy="10" rx="5" ry="3" fill="#7C6099" />
            </g>
          </svg>
        </div>
      </section>

      {/* ── 2. Horizontal Filter Chips / Category Pills ── */}
      <nav className="shop-pills-row" aria-label="Category Filters">
        <div className="shop-pills-scroll">
          {PRESET_PILLS.map((pill) => {
            const isActive = activePill === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handlePillClick(pill.id, pill.queryParam)}
                className={`shop-pill-chip ${isActive ? "active" : ""}`}
              >
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── 3. Product Count & Filter / Sort Action Bar ── */}
      <section className="shop-controls-bar">
        <div className="shop-product-count">
          <strong>{filteredProducts.length}</strong> Products
        </div>

        <div className="shop-controls-actions">
          <button
            type="button"
            className="shop-control-btn"
            onClick={() => setFilterModalOpen(true)}
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
            {selectedFabric !== "all" && <span className="control-indicator">•</span>}
          </button>

          <button
            type="button"
            className="shop-control-btn"
            onClick={() => setSortModalOpen(true)}
          >
            <ArrowUpDown size={14} />
            <span>Sort</span>
          </button>
        </div>
      </section>

      {/* ── 4. 2-Column Mobile Product Grid ── */}
      <section className="shop-grid-section">
        {filteredProducts.length > 0 ? (
          <div className="mobile-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="shop-empty-state">
            <span style={{ fontSize: "2.8rem", display: "block", marginBottom: 12 }}>🌿</span>
            <h3>No garments match your filters</h3>
            <p>Try resetting the category filter or searching for another silhouette.</p>
            <button
              type="button"
              onClick={() => {
                setActivePill("all");
                setSelectedFabric("all");
                router.push("/shop");
              }}
              className="button button--gold"
              style={{ marginTop: 16 }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ── 5. Interactive Filter Bottom Drawer ── */}
      {filterModalOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setFilterModalOpen(false)}>
          <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <h3>Filter Garments</h3>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="mobile-drawer-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              {/* Fabric Selection */}
              <div className="drawer-filter-group">
                <span className="drawer-filter-title">Fabric & Weave</span>
                <div className="drawer-chips-grid">
                  {["all", "Chanderi", "Cotton", "Silk", "Organza", "Linen"].map((fab) => (
                    <button
                      key={fab}
                      type="button"
                      onClick={() => setSelectedFabric(fab)}
                      className={`drawer-chip ${selectedFabric === fab ? "selected" : ""}`}
                    >
                      <span>{fab === "all" ? "All Fabrics" : fab}</span>
                      {selectedFabric === fab && <Check size={13} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mobile-drawer-footer">
              <button
                type="button"
                onClick={() => {
                  setSelectedFabric("all");
                  setActivePill("all");
                  setFilterModalOpen(false);
                }}
                className="drawer-btn-secondary"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="drawer-btn-primary"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Interactive Sort Bottom Drawer ── */}
      {sortModalOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setSortModalOpen(false)}>
          <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <h3>Sort By</h3>
              <button
                type="button"
                onClick={() => setSortModalOpen(false)}
                className="mobile-drawer-close"
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
                  { id: "price-desc", label: "Price: High to Low" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id as any);
                      setSortModalOpen(false);
                    }}
                    className={`drawer-sort-option ${sortBy === opt.id ? "selected" : ""}`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check size={16} color="#3A4B37" />}
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
