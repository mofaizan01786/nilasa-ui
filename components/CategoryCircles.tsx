import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/lib/types";
import { Sparkles, Layers, Package, Shirt, Gem, Crown } from "lucide-react";

interface CategoryCirclesProps {
  categories?: Category[];
}

const DEFAULT_CATEGORY_DATA: Record<string, { image: string; icon: React.ReactNode }> = {
  suits: {
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
    icon: <Crown size={22} color="var(--nilasa-gold, #D4B258)" />
  },
  kurtis: {
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
    icon: <Shirt size={22} color="var(--nilasa-gold, #D4B258)" />
  },
  "co-ord-sets": {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
    icon: <Layers size={22} color="var(--nilasa-gold, #D4B258)" />
  },
  "unstitched-suits": {
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
    icon: <Package size={22} color="var(--nilasa-gold, #D4B258)" />
  },
  dupattas: {
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80",
    icon: <Sparkles size={22} color="var(--nilasa-gold, #D4B258)" />
  },
  lehengas: {
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80",
    icon: <Gem size={22} color="var(--nilasa-gold, #D4B258)" />
  }
};

export function CategoryCircles({ categories = [] }: CategoryCirclesProps) {
  const items: Category[] = categories && categories.length > 0
    ? categories
    : [
        { categoryId: 1, id: 1, name: "Suits & Anarkalis", slug: "suits" },
        { categoryId: 2, id: 2, name: "Kurtis", slug: "kurtis" },
        { categoryId: 3, id: 3, name: "Co-Ord Sets", slug: "co-ord-sets" },
        { categoryId: 4, id: 4, name: "Unstitched Suits", slug: "unstitched-suits" },
        { categoryId: 5, id: 5, name: "Dupattas", slug: "dupattas" },
        { categoryId: 6, id: 6, name: "Festive Lehengas", slug: "lehengas" }
      ];

  return (
    <section className="category-circles-wrapper shell">
      <div className="category-circles-container">
        {items.map((cat) => {
          const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-");
          const info = DEFAULT_CATEGORY_DATA[slug] || {
            image: cat.imageUrl || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
            icon: <Crown size={22} color="var(--nilasa-gold, #D4B258)" />
          };

          return (
            <Link
              key={cat.categoryId || cat.id || slug}
              href={`/shop?category=${slug}`}
              className="category-circle-item"
              title={`Shop ${cat.name}`}
            >
              <div className="category-circle-ring">
                <div className="category-circle-inner">
                  {cat.imageUrl || info.image ? (
                    <Image
                      src={cat.imageUrl || info.image}
                      alt={cat.name}
                      fill
                      sizes="96px"
                      className="category-circle-img"
                    />
                  ) : (
                    <div className="category-circle-fallback">
                      {info.icon}
                    </div>
                  )}
                </div>
              </div>
              <span className="category-circle-name">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
