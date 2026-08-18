"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, searchProducts, formatPrice, getProductImage } from "@/lib/catalog";
import { fetchPublishedProducts } from "@/lib/api";
import { Search, X, ArrowRight, Sparkles, ShoppingBag, ArrowUpRight, TrendingUp } from "lucide-react";

const QUICK_SEARCH_CHIPS = [
  { label: "✨ Festive Edit", query: "Suit" },
  { label: "Indigo Anarkali", query: "Indigo" },
  { label: "Chanderi Kurtis", query: "Kurti" },
  { label: "Linen Co-Ords", query: "Co-Ord" },
  { label: "Zari Silk", query: "Silk" },
  { label: "Unstitched", query: "Unstitched" }
];

export function SearchBar({ allProducts }: { allProducts?: Product[] }) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOverlayOpen, setMobileOverlayOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [catalog, setCatalog] = useState<Product[]>(allProducts || []);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load catalog products
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      setCatalog(allProducts);
    } else {
      fetchPublishedProducts()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setCatalog(data);
          }
        })
        .catch(() => {});
    }
  }, [allProducts]);

  // Live query filtering
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      const matched = searchProducts(catalog, trimmed);
      setResults(matched);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, catalog]);

  // Keyboard shortcut listener (Cmd/Ctrl + K or Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (window.innerWidth <= 768) {
          setMobileOverlayOpen(true);
        } else {
          inputRef.current?.focus();
          setIsOpen(true);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setMobileOverlayOpen(false);
      }
    };
    const handleOpenSearch = () => {
      setMobileOverlayOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-nilasa-search", handleOpenSearch);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-nilasa-search", handleOpenSearch);
    };
  }, []);

  // Lock body scroll when mobile search is open
  useEffect(() => {
    if (mobileOverlayOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => mobileInputRef.current?.focus(), 150);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOverlayOpen]);

  // Close dropdown on outside click (desktop)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectChip = (chipQuery: string) => {
    setQuery(chipQuery);
    if (mobileOverlayOpen) {
      mobileInputRef.current?.focus();
    } else {
      inputRef.current?.focus();
      setIsOpen(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      setMobileOverlayOpen(false);
      startTransition(() => {
        router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      });
    }
  };

  return (
    <>
      {/* ─── DESKTOP SEARCH BAR (Hidden on Mobile) ─── */}
      <div className="search-bar-desktop mobile-search-hidden" ref={containerRef}>
        <form onSubmit={handleSearchSubmit} className="search-form" role="search">
          <div className="search-input-pill">
            <Search size={15} className="search-pill-icon" color="var(--nilasa-indigo)" />

            <input
              ref={inputRef}
              type="text"
              className="search-pill-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim() || catalog.length > 0) setIsOpen(true);
              }}
              placeholder="Search suits, kurtis, fabrics..."
              aria-label="Search Nilasa catalog"
              autoComplete="off"
            />

            {query ? (
              <button
                type="button"
                className="search-pill-clear"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                aria-label="Clear query"
              >
                <X size={13} />
              </button>
            ) : (
              <kbd className="search-pill-kbd" title="Press ⌘K or Ctrl+K to search">
                ⌘K
              </kbd>
            )}
          </div>
        </form>

        {/* Desktop Live Results Dropdown */}
        {isOpen && (
          <div className="search-dropdown-menu">
            <div className="search-dropdown-header">
              <span className="search-results-label">
                {query.trim()
                  ? `${results.length} piece${results.length === 1 ? "" : "s"} found for "${query}"`
                  : "Trending Collections"}
              </span>
              <span className="search-brand-tag">Nilasa Catalog</span>
            </div>

            {/* Results List */}
            {query.trim() && results.length > 0 && (
              <div className="search-results-scroller">
                {results.slice(0, 5).map((product) => {
                  const imgUrl = getProductImage(product);
                  return (
                    <Link
                      key={product.productId || product.id || product.slug}
                      href={`/product/${product.slug}`}
                      className="search-item-row"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="search-item-thumb">
                        <Image
                          src={imgUrl}
                          alt={product.name}
                          width={44}
                          height={56}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className="search-item-info">
                        <span className="search-item-title">{product.name}</span>
                        <div className="search-item-tags">
                          <span className="search-item-category">
                            {product.categoryName || "Ethnic Wear"}
                          </span>
                          {product.fabric && (
                            <span className="search-item-fabric">• {product.fabric}</span>
                          )}
                        </div>
                      </div>
                      <div className="search-item-cost">
                        {formatPrice(product.basePrice)}
                      </div>
                    </Link>
                  );
                })}

                {results.length > 5 && (
                  <Link
                    href={`/shop?q=${encodeURIComponent(query)}`}
                    className="search-view-all-btn"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>View all {results.length} matching pieces</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            )}

            {/* Empty State when no items match */}
            {query.trim() && results.length === 0 && (
              <div className="search-no-results">
                <p>No garments matched &ldquo;{query}&rdquo;. Try exploring our festive categories:</p>
              </div>
            )}

            {/* Quick Filter Chips */}
            <div className="search-chips-section">
              <div className="search-chips-title">
                <Sparkles size={13} color="var(--nilasa-gold)" />
                <span>Popular Searches:</span>
              </div>
              <div className="search-chips-list">
                {QUICK_SEARCH_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    className="search-chip-btn"
                    onClick={() => handleSelectChip(chip.query)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MOBILE SEARCH TRIGGER BUTTON (Sleek Minimalist Icon in Navbar) ─── */}
      <div className="search-bar-mobile-trigger">
        <button
          type="button"
          onClick={() => setMobileOverlayOpen(true)}
          className="search-mobile-icon-btn"
          aria-label="Open search dialog"
        >
          <Search size={20} strokeWidth={1.9} />
        </button>
      </div>

      {/* ─── FULLSCREEN LUXURY MOBILE SEARCH OVERLAY MODAL (PORTALED TO BODY) ─── */}
      {mounted &&
        mobileOverlayOpen &&
        createPortal(
          <div className="mobile-search-overlay" role="dialog" aria-modal="true" aria-label="Search Nilasa">
            <div className="mobile-search-backdrop" onClick={() => setMobileOverlayOpen(false)} />

            <div className="mobile-search-sheet">
              {/* Top Search Input Bar */}
              <div className="mobile-search-topbar">
                <form onSubmit={handleSearchSubmit} className="mobile-search-form" role="search">
                  <div className="mobile-search-input-wrapper">
                    <Search size={18} color="#8E6EA8" className="mobile-search-icon" />
                    <input
                      ref={mobileInputRef}
                      type="search"
                      className="mobile-search-input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search suits, kurtis, dupattas..."
                      autoComplete="off"
                    />
                    {query && (
                      <button
                        type="button"
                        className="mobile-search-clear"
                        onClick={() => {
                          setQuery("");
                          setResults([]);
                          mobileInputRef.current?.focus();
                        }}
                        aria-label="Clear search query"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </form>

                <button
                  type="button"
                  onClick={() => setMobileOverlayOpen(false)}
                  className="mobile-search-close-btn"
                  aria-label="Cancel and close search"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="mobile-search-chips-row">
                <span className="mobile-chips-heading">
                  <TrendingUp size={12} color="#8E6EA8" style={{ marginRight: 4, display: "inline" }} />
                  Trending:
                </span>
                <div className="mobile-chips-scroll">
                  {QUICK_SEARCH_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      className="mobile-chip-pill"
                      onClick={() => handleSelectChip(chip.query)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Search Results / Trending Shortcuts */}
              <div className="mobile-search-results-body">
                {query.trim() ? (
                  results.length > 0 ? (
                    <div className="mobile-results-list">
                      <div className="mobile-results-count">
                        <span>{results.length} garment{results.length === 1 ? "" : "s"} found</span>
                      </div>
                      {results.map((product) => {
                        const imgUrl = getProductImage(product);
                        return (
                          <Link
                            key={product.productId || product.id || product.slug}
                            href={`/product/${product.slug}`}
                            className="mobile-result-card"
                            onClick={() => setMobileOverlayOpen(false)}
                          >
                            <div className="mobile-result-img">
                              <Image
                                src={imgUrl}
                                alt={product.name}
                                width={56}
                                height={72}
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                            <div className="mobile-result-content">
                              <span className="mobile-result-title">{product.name}</span>
                              <span className="mobile-result-category">
                                {product.categoryName || "Ethnic Wear"} {product.fabric && `• ${product.fabric}`}
                              </span>
                              <span className="mobile-result-price">{formatPrice(product.basePrice)}</span>
                            </div>
                            <ArrowUpRight size={16} color="#8E6EA8" />
                          </Link>
                        );
                      })}

                      <Link
                        href={`/shop?q=${encodeURIComponent(query)}`}
                        className="mobile-view-all-link"
                        onClick={() => setMobileOverlayOpen(false)}
                      >
                        <span>Explore all {results.length} matching pieces</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div className="mobile-no-results">
                      <ShoppingBag size={34} color="#8E6EA8" style={{ opacity: 0.8 }} />
                      <p>No results found for &ldquo;{query}&rdquo;</p>
                      <span>Try exploring with broader terms like &ldquo;Suit&rdquo;, &ldquo;Kurti&rdquo;, or &ldquo;Silk&rdquo;.</span>
                    </div>
                  )
                ) : (
                  <div className="mobile-search-placeholder">
                    <span className="mobile-placeholder-label">
                      POPULAR ETHNIC CATEGORIES
                    </span>
                    <div className="mobile-featured-links">
                      <Link href="/shop" onClick={() => setMobileOverlayOpen(false)}>
                        <span>✨ All Collections</span>
                        <ArrowRight size={14} color="#8E6EA8" />
                      </Link>
                      <Link href="/category/suits" onClick={() => setMobileOverlayOpen(false)}>
                        <span>Anarkali & Suit Sets</span>
                        <ArrowRight size={14} color="#8E6EA8" />
                      </Link>
                      <Link href="/category/kurtis" onClick={() => setMobileOverlayOpen(false)}>
                        <span>Everyday & Festive Kurtis</span>
                        <ArrowRight size={14} color="#8E6EA8" />
                      </Link>
                      <Link href="/category/co-ord-sets" onClick={() => setMobileOverlayOpen(false)}>
                        <span>Linen & Silk Co-Ord Sets</span>
                        <ArrowRight size={14} color="#8E6EA8" />
                      </Link>
                      <Link href="/category/unstitched-suits" onClick={() => setMobileOverlayOpen(false)}>
                        <span>Unstitched Suit Materials</span>
                        <ArrowRight size={14} color="#8E6EA8" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
