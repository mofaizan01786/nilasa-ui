"use client";

import Image from "next/image";
import Link from "next/link";
import { Category } from "@/lib/types";

const CATEGORY_IMAGES: Record<string, string> = {
  suits: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
  kurtis: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  "co-ord-sets": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
  dupattas: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
  lehengas: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80",
  "unstitched-suits": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"
};

export function CuratedCategories({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="nilasa-categories-section shell" aria-label="Shop by Category">
      <div className="nilasa-section-header">
        <div>
          <span className="eyebrow eyebrow--gold">CURATED EDITS</span>
          <h2 className="nilasa-section-title">Shop by Category</h2>
        </div>
        <Link href="/shop" className="nilasa-view-all-link">
          <span>Explore All Categories</span>
          <span className="arrow">→</span>
        </Link>
      </div>

      <div className="nilasa-categories-grid">
        {categories.slice(0, 6).map((category) => {
          const imgUrl =
            category.imageUrl ||
            CATEGORY_IMAGES[category.slug] ||
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80";

          return (
            <Link
              key={category.id || category.slug}
              href={`/category/${category.slug}`}
              className="nilasa-category-card"
            >
              <div className="nilasa-category-card__media">
                <Image
                  src={imgUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="nilasa-category-card__image"
                />
                <div className="nilasa-category-card__overlay" />
              </div>

              <div className="nilasa-category-card__content">
                <h3 className="nilasa-category-card__name">{category.name}</h3>
                <span className="nilasa-category-card__action">
                  <span>View</span>
                  <span className="nilasa-category-card__line" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
