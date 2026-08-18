import Link from "next/link";
import { Category } from "@/lib/types";
import { Sparkles, Layers, Package, Shirt, Gem, Crown } from "lucide-react";

const CATEGORY_ITEMS = [
  {
    slug: "suits",
    name: "SUITS",
    tagline: "Stitched Suits & Anarkalis",
    icon: <Crown size={28} color="var(--nilasa-indigo)" strokeWidth={1.8} />
  },
  {
    slug: "kurtis",
    name: "KURTIS",
    tagline: "Everyday Luxury Kurtas",
    icon: <Shirt size={28} color="var(--nilasa-indigo)" strokeWidth={1.8} />
  },
  {
    slug: "co-ord-sets",
    name: "CO-ORD SETS",
    tagline: "Fluid Two-Piece Sets",
    icon: <Layers size={28} color="var(--nilasa-indigo)" strokeWidth={1.8} />
  },
  {
    slug: "unstitched-suits",
    name: "UNSTITCHED SUITS",
    tagline: "Custom Dress Materials",
    icon: <Package size={28} color="var(--nilasa-indigo)" strokeWidth={1.8} />
  },
  {
    slug: "dupattas",
    name: "DUPATTAS",
    tagline: "Handcrafted Zari & Silk",
    icon: <Sparkles size={28} color="var(--nilasa-indigo)" strokeWidth={1.8} />
  },
  {
    slug: "lehengas",
    name: "LEHENGAS",
    tagline: "Sculptural Festive Sets",
    icon: <Gem size={28} color="var(--nilasa-indigo)" strokeWidth={1.8} />
  }
];

export function CategoryStrip({ categories }: { categories?: Category[] }) {
  const displayItems = categories && categories.length > 0
    ? categories.map((c) => {
        const itemMatch = CATEGORY_ITEMS.find((ci) => ci.slug === c.slug);
        return {
          slug: c.slug,
          name: c.name.toUpperCase(),
          tagline: c.description || "Artisanal Ethnic Collection",
          icon: itemMatch ? itemMatch.icon : CATEGORY_ITEMS[0].icon
        };
      })
    : CATEGORY_ITEMS;

  return (
    <section className="category-strip-section shell">
      <div className="category-strip-header">
        <span className="eyebrow eyebrow--rose">THE NILASA CATALOGUE</span>
        <h2>Explore By Category</h2>
        <p className="category-strip-sub">Curated Indian ethnic wear designed with grace in every thread.</p>
      </div>

      <div className="category-grid">
        {displayItems.map((item) => (
          <Link key={item.slug} href={`/category/${item.slug}`} className="category-card">
            <div className="category-card__icon">{item.icon}</div>
            <h3 className="category-card__name">{item.name}</h3>
            <span className="category-card__tagline">{item.tagline}</span>
            <div className="category-card__arrow">→</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
