"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroBannerConfig } from "@/lib/types";

interface EditorialHeroProps {
  hero?: HeroBannerConfig;
}

export function EditorialHero({ hero }: EditorialHeroProps) {
  const imageUrl =
    hero?.imageUrl ||
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2560&q=90";

  const eyebrow = hero?.eyebrow || hero?.tagPill || "Redefine Your Elegance";
  const headline = hero?.headline || "CONFIDENCE IN MOTION";
  const primaryHref = hero?.primaryCta?.href || "/shop";
  const primaryLabel = hero?.primaryCta?.label || "Shop Suits";
  const secondaryHref = hero?.secondaryCta?.href || "/category/co-ord-sets";
  const secondaryLabel = hero?.secondaryCta?.label || "Shop Co-Ords";

  return (
    <section className="nilasa-hero" aria-label="Featured Collection Hero">
      {/* Full-Bleed Background Media */}
      <div className="nilasa-hero__media">
        <Image
          src={imageUrl}
          alt={headline}
          fill
          priority
          sizes="100vw"
          className="nilasa-hero__image"
        />
        <div className="nilasa-hero__overlay" />
      </div>

      {/* Signature Nilasa Centered Bottom Content */}
      <div className="nilasa-hero__content shell">
        <div className="nilasa-hero__bottom-box">
          {eyebrow && (
            <p className="nilasa-hero__eyebrow">
              {eyebrow}
            </p>
          )}

          <h1 className="nilasa-hero__title">
            {headline}
          </h1>

          {/* Dual Interactive Links with Underlines */}
          <div className="nilasa-hero__cta-group">
            <Link href={primaryHref} className="nilasa-hero__underline-link">
              {primaryLabel}
            </Link>
            <Link href={secondaryHref} className="nilasa-hero__underline-link">
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
