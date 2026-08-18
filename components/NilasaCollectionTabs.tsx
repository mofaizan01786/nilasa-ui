"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

interface NilasaCollectionTabsProps {
  products: Product[];
}

const TABS = [
  { id: "all", label: "All Pieces" },
  { id: "suits", label: "Suits & Anarkalis", filter: "suit" },
  { id: "coords", label: "Trending Co-Ords", filter: "co-ord" },
  { id: "kurtis", label: "Chic Kurtis", filter: "kurti" },
  { id: "dupattas", label: "Pure Silk Dupattas", filter: "dupatta" }
];

export function NilasaCollectionTabs({ products }: NilasaCollectionTabsProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return true;
    const tabObj = TABS.find((t) => t.id === activeTab);
    if (!tabObj || !tabObj.filter) return true;
    const f = tabObj.filter.toLowerCase();
    return (
      p.name.toLowerCase().includes(f) ||
      p.slug.toLowerCase().includes(f) ||
      p.categoryName?.toLowerCase().includes(f)
    );
  });

  return (
    <section className="nilasa-tabs-section shell" aria-label="Curated Collection Tabs">
      <div className="nilasa-tabs-header">
        <div className="nilasa-tabs-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`nilasa-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="nilasa-tabs-grid">
        {(filteredProducts.length > 0 ? filteredProducts : products)
          .slice(0, 8)
          .map((prod) => (
            <ProductCard key={prod.id || prod.slug} product={prod} />
          ))}
      </div>
    </section>
  );
}
