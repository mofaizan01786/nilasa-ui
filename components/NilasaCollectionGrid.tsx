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

export function NilasaCollectionGrid({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="nilasa-collections shell" aria-label="Collections Grid">
      <div className="nilasa-collections__head">
        <h2 className="nilasa-collections__title">
          Explore this season’s newest collections
        </h2>
        <Link href="/shop" className="nilasa-link-underline">
          View All Categories
        </Link>
      </div>

      <div className="nilasa-collections__grid">
        {categories.slice(0, 6).map((cat) => {
          const imgUrl =
            cat.imageUrl ||
            CATEGORY_IMAGES[cat.slug] ||
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80";

          return (
            <Link
              key={cat.id || cat.slug}
              href={`/category/${cat.slug}`}
              className="nilasa-collection-card"
            >
              <div className="nilasa-collection-card__media">
                <Image
                  src={imgUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="nilasa-collection-card__image"
                />
              </div>
              <h3 className="nilasa-collection-card__name">{cat.name}</h3>
              <span className="nilasa-collection-card__count">
                {cat.productCount ? `${cat.productCount} Products` : "Explore Edit"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
