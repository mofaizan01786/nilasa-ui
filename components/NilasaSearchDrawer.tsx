"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { fetchPublishedProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import { formatPrice, getProductImage } from "@/lib/catalog";

interface NilasaSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_TOP_SELLERS = [
  {
    id: 101,
    name: "Indigo Pleat Anarkali Suit",
    slug: "indigo-pleat-anarkali-suit",
    basePrice: 6490,
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 102,
    name: "Sage Chanderi Kurti Set",
    slug: "sage-chanderi-kurti-set",
    basePrice: 3890,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 103,
    name: "Rose Zari Silk Co-Ord Set",
    slug: "rose-zari-silk-co-ord-set",
    basePrice: 4990,
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 104,
    name: "Ivory Banarasi Silk Dupatta",
    slug: "ivory-banarasi-silk-dupatta",
    basePrice: 2490,
    imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80"
  }
];

export function NilasaSearchDrawer({ isOpen, onClose }: NilasaSearchDrawerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load products
  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      fetchPublishedProducts()
        .then((prods) => {
          if (isMounted && prods && prods.length > 0) {
            setAllProducts(prods);
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen]);

  // Focus input & lock body scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query.toLowerCase().trim();
    const matches = allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        p.fabric?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
    setResults(matches);
    setIsLoading(false);
  }, [query, allProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  if (!isOpen || !mounted) return null;

  const topSellers = allProducts.length >= 4 ? allProducts.slice(0, 4) : FALLBACK_TOP_SELLERS;

  return createPortal(
    <div
      className="nilasa-search-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Predictive Search"
    >
      <div className="nilasa-search-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Top Search Input Box & Close Button */}
        <div className="nilasa-search-modal-head">
          <form onSubmit={handleSubmit} className="nilasa-search-modal-input-box">
            <Search size={18} className="nilasa-search-modal-icon" color="#212121" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a product..."
              className="nilasa-search-modal-input"
              autoComplete="off"
              spellCheck="false"
            />
            {isLoading && <Loader2 size={16} className="animate-spin" color="#6B6B6B" />}
          </form>

          <button
            type="button"
            onClick={onClose}
            className="nilasa-search-modal-close-btn"
            aria-label="Close search"
          >
            <X size={24} color="#212121" />
          </button>
        </div>

        {/* Content Area */}
        <div className="nilasa-search-modal-content">
          {query.trim() ? (
            /* Live Predictive Search Results */
            <div className="nilasa-search-modal-results">
              <span className="nilasa-search-modal-title">
                {results.length > 0
                  ? `RESULTS (${results.length})`
                  : `NO PRODUCTS FOUND FOR "${query}"`}
              </span>

              {results.length > 0 ? (
                <div className="nilasa-search-modal-grid">
                  {results.slice(0, 6).map((prod) => {
                    const img = getProductImage(prod);
                    return (
                      <Link
                        key={prod.id || prod.slug}
                        href={`/product/${prod.slug}`}
                        onClick={onClose}
                        className="nilasa-search-modal-item"
                      >
                        <div className="nilasa-search-modal-media">
                          <Image
                            src={img}
                            alt={prod.name}
                            fill
                            sizes="(max-width: 600px) 50vw, 200px"
                            className="nilasa-search-modal-img"
                          />
                        </div>
                        <h4 className="nilasa-search-modal-item-title">{prod.name}</h4>
                        <span className="nilasa-search-modal-item-price">
                          {formatPrice(prod.basePrice)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="nilasa-search-modal-empty">
                  <p>Try searching for "Suits", "Kurtis", "Cotton", or "Silk".</p>
                </div>
              )}
            </div>
          ) : (
            /* Top Sellers Default View (Exact Screenshot 2) */
            <div className="nilasa-search-modal-topsellers">
              <h3 className="nilasa-search-modal-title">TOP SELLERS</h3>
              <div className="nilasa-search-modal-grid">
                {topSellers.map((prod) => {
                  const img = getProductImage(prod as Product);
                  return (
                    <Link
                      key={prod.id || prod.slug}
                      href={`/product/${prod.slug}`}
                      onClick={onClose}
                      className="nilasa-search-modal-item"
                    >
                      <div className="nilasa-search-modal-media">
                        <Image
                          src={img}
                          alt={prod.name}
                          fill
                          sizes="(max-width: 600px) 50vw, 200px"
                          className="nilasa-search-modal-img"
                        />
                      </div>
                      <h4 className="nilasa-search-modal-item-title">{prod.name}</h4>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
