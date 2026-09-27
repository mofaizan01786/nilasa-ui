import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface OccasionCard {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  badge?: string;
}

const OCCASIONS: OccasionCard[] = [
  {
    title: "Wedding & Sangeet Grandeur",
    subtitle: "Ornate zari embroidery and pure handloom silks",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=suits",
    badge: "ROYAL EDITION"
  },
  {
    title: "Everyday Luxury & Workwear",
    subtitle: "Breathable mulmul cotton and relaxed Chanderi silhouettes",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=kurtis",
    badge: "COMFORT LUXE"
  },
  {
    title: "Contemporary Co-Ord Sets",
    subtitle: "Fluid two-piece ensembles for modern occasions",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=co-ord-sets",
    badge: "TRENDING"
  },
  {
    title: "Unstitched Heirlooms",
    subtitle: "Custom tailoring dress materials woven with heritage motifs",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=unstitched-suits",
    badge: "HANDLOOM"
  }
];

export function OccasionGrid() {
  return (
    <section className="section shell occasion-section">
      <div className="section-head" style={{ marginBottom: "28px" }}>
        <div>
          <span className="eyebrow eyebrow--gold">SHOP BY OCCASION</span>
          <h2 style={{ fontFamily: "var(--font-display)", margin: "6px 0 0" }}>
            Curated For Every Milestone
          </h2>
        </div>
        <Link href="/shop" className="text-link">
          <span>View All Collections</span>
          <span>→</span>
        </Link>
      </div>

      <div className="occasion-grid">
        {OCCASIONS.map((occ, idx) => (
          <Link
            key={idx}
            href={occ.link}
            className="occasion-card"
          >
            <div className="occasion-card__image-wrap">
              <Image
                src={occ.image}
                alt={occ.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="occasion-card__img"
              />
              <div className="occasion-card__overlay" />
            </div>

            <div className="occasion-card__content">
              {occ.badge && (
                <span className="occasion-card__badge">{occ.badge}</span>
              )}
              <h3 className="occasion-card__title">{occ.title}</h3>
              <p className="occasion-card__subtitle">{occ.subtitle}</p>
              <div className="occasion-card__cta">
                <span>Explore Edit</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
