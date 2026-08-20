"use client";

import Image from "next/image";
import Link from "next/link";
import { NilasaParallaxCard } from "@/components/NilasaParallaxCard";
import { NilasaScrollReveal } from "@/components/NilasaScrollReveal";

interface DualBannerItem {
  eyebrow: string;
  ctaText: string;
  href: string;
  imageUrl: string;
}

const DEFAULT_BANNERS: [DualBannerItem, DualBannerItem] = [
  {
    eyebrow: "NILASA ATELIER COLLECTION",
    ctaText: "Shop the Collection",
    href: "/category/suits",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85"
  },
  {
    eyebrow: "NEW SEASON CO-ORDS & DRAPES",
    ctaText: "Shop New Arrivals",
    href: "/category/co-ord-sets",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85"
  }
];

export function NilasaDualBanners({ banners = DEFAULT_BANNERS }: { banners?: [DualBannerItem, DualBannerItem] }) {
  return (
    <section className="nilasa-dual-banners shell" aria-label="Featured Collection Banners">
      <div className="nilasa-dual-banners__grid">
        {banners.map((item, idx) => (
          <NilasaScrollReveal
            key={idx}
            animation={idx === 0 ? "fade-right" : "fade-left"}
            delay={idx * 150}
            duration={900}
          >
            <NilasaParallaxCard
              maxTilt={5}
              scale={1.015}
              className="nilasa-dual-card"
            >
              <div className="nilasa-dual-card__media">
                <Image
                  src={item.imageUrl}
                  alt={item.eyebrow}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="nilasa-dual-card__image"
                />
                <div className="nilasa-dual-card__overlay" />
              </div>

              <div className="nilasa-dual-card__content">
                <p className="nilasa-dual-card__eyebrow">{item.eyebrow}</p>
                <Link href={item.href} className="nilasa-dual-card__link">
                  <span>{item.ctaText}</span>
                </Link>
              </div>
            </NilasaParallaxCard>
          </NilasaScrollReveal>
        ))}
      </div>
    </section>
  );
}
