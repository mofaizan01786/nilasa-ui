"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Product, Category } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { Sparkles, ArrowRight, Flame, Star, PackageCheck } from "lucide-react";

interface TabbedProductShowcaseProps {
  products: Product[];
  categories?: Category[];
  title?: string;
  eyebrow?: string;
}

export function TabbedProductShowcase({
  products = [],
  categories = [],
  title = "Most Loved & New Curations",
  eyebrow = "HANDCRAFTED ATELIER"
}: TabbedProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState<string>("bestsellers");

  // Define tab definitions
  const tabs = useMemo(() => [
    { id: "bestsellers", label: "Best Sellers", icon: <Flame size={14} color="#E9C46A" /> },
    { id: "new", label: "New Arrivals", icon: <Sparkles size={14} color="#D4B258" /> },
    { id: "festive", label: "Festive Edit", icon: <Star size={14} color="#D4B258" /> },
    { id: "all", label: "All Items", icon: <PackageCheck size={14} color="#D4B258" /> }
  ], []);

  // Filter and sort products based on active tab
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    if (activeTab === "bestsellers") {
      // 1. Strict filter: Products explicitly tagged as isBestseller
      const bestsellers = products.filter((p) => p.isBestseller);
      if (bestsellers.length > 0) return bestsellers.slice(0, 8);

      // Fallback if no products are explicitly tagged yet
      const sorted = [...products].sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
      return sorted.slice(0, 8);
    }

    if (activeTab === "new") {
      // 2. Strict filter: Products explicitly tagged as isNewArrival
      const newArrivals = products.filter((p) => p.isNewArrival);
      if (newArrivals.length > 0) return newArrivals.slice(0, 8);

      // Fallback if no products are explicitly tagged yet
      const sorted = [...products].sort((a, b) => (b.productId || b.id || 0) - (a.productId || a.id || 0));
      return sorted.slice(0, 8);
    }

    if (activeTab === "festive") {
      // 3. Strict filter: Products explicitly tagged as isFeatured or having festive tags
      const featured = products.filter((p) => {
        if (p.isFeatured) return true;
        const tags = (p.tags || "").toLowerCase();
        return tags.includes("festive") || tags.includes("wedding") || tags.includes("party") || tags.includes("zari") || tags.includes("silk");
      });
      if (featured.length > 0) return featured.slice(0, 8);

      // Fallback if no products are explicitly tagged yet
      const festiveItems = products.filter((p) => {
        const cat = (p.categoryName || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        return (
          cat.includes("suit") ||
          cat.includes("lehenga") ||
          cat.includes("anarkali") ||
          cat.includes("dupatta") ||
          name.includes("silk") ||
          name.includes("zari") ||
          name.includes("embroidery")
        );
      });
      return festiveItems.length > 0 ? festiveItems.slice(0, 8) : products.slice(0, 8);
    }

    // Default "all"
    return products.slice(0, 8);
  }, [products, activeTab]);

  // Dynamic CTA Target & Label based on active tab (mapped to backend ?collection= / ?tag=)
  const ctaLink = useMemo(() => {
    if (activeTab === "bestsellers") return "/shop?collection=bestsellers";
    if (activeTab === "new") return "/shop?collection=new";
    if (activeTab === "festive") return "/shop?collection=featured";
    return "/shop";
  }, [activeTab]);

  const ctaLabel = useMemo(() => {
    if (activeTab === "bestsellers") return "Explore All Best Sellers";
    if (activeTab === "new") return "Explore All New Arrivals";
    if (activeTab === "festive") return "Explore Entire Festive Edit";
    return `Explore Entire Catalog (${products.length} Designs)`;
  }, [activeTab, products.length]);

  return (
    <section className="section shell tabbed-showcase-section">
      <div className="tabbed-showcase-header">
        <div>
          <span className="eyebrow eyebrow--gold">{eyebrow}</span>
          <h2 className="tabbed-showcase-title">{title}</h2>
        </div>

        {/* Interactive Tab Switcher Pills */}
        <div className="tab-pills-scroll-container">
          <div className="tab-pills-wrapper">
            {tabs.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`tab-pill-btn ${isActive ? "tab-pill-btn--active" : ""}`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-muted, #94A3B8)" }}>
          <p>No products available in this selection.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.productId || product.id || product.slug} product={product} />
          ))}
        </div>
      )}

      {/* Dynamic Footer Explore Link */}
      <div style={{ textAlign: "center", marginTop: "36px" }}>
        <Link
          href={ctaLink}
          className="tabbed-showcase-cta"
        >
          <span>{ctaLabel}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
