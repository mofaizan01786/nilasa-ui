"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Star,
  Truck,
  ArrowRight,
  Tag
} from "lucide-react";
import { HeroSlideItem } from "@/lib/types";

export interface HeroSlide {
  id: string;
  tag: string;
  headline: string;
  subheadline?: string;
  description: string;
  offerBadge?: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  imageUrl: string;
  featuredPiece?: {
    title: string;
    subtitle: string;
    href: string;
    tag?: string;
  };
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    tag: "FESTIVE EDIT 2026",
    headline: "Grace In Every Thread",
    subheadline: "Handcrafted Luxury",
    description:
      "Thoughtfully cut Indian ethnic wear designed for quiet confidence. Handcrafted Chanderi silks, zari woven suit sets, and versatile separates.",
    offerBadge: "Use Code NILASA10 for 10% Off",
    primaryCta: {
      label: "Explore Collection →",
      href: "/shop"
    },
    secondaryCta: {
      label: "View Suit Sets",
      href: "/category/suits"
    },
    imageUrl:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85",
    featuredPiece: {
      title: "SIGNATURE PIECE",
      subtitle: "Indigo Pleat Anarkali Suit • ₹6,490",
      href: "/product/indigo-pleat-anarkali-suit",
      tag: "BESTSELLER"
    }
  },
  {
    id: "slide-2",
    tag: "ROYAL CHANDERI COLLECTION",
    headline: "Timeless Heritage Weaves",
    subheadline: "Pure Zari & Tissue Silk",
    description:
      "Intricate zari motifs woven on heritage handloom looms. Designed in rich festive hues for grand occasions and quiet celebrations.",
    offerBadge: "Complimentary Express Shipping Across India",
    primaryCta: {
      label: "Shop Chanderi Silks →",
      href: "/category/suits"
    },
    secondaryCta: {
      label: "Discover Kurtis",
      href: "/category/kurtis"
    },
    imageUrl:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
    featuredPiece: {
      title: "HERITAGE EDITION",
      subtitle: "Rose Tissue Silk Kurta Set • ₹7,990",
      href: "/shop",
      tag: "NEW ARRIVAL"
    }
  },
  {
    id: "slide-3",
    tag: "CONTEMPORARY ETHNIC",
    headline: "Modern Minimalist Poise",
    subheadline: "Effortless Everyday Grace",
    description:
      "Fluid silhouettes crafted from breathable natural fibers. Transition seamlessly from daytime desk wear to evening gatherings.",
    offerBadge: "Limited Artisanal Batch",
    primaryCta: {
      label: "Explore Co-Ord Sets →",
      href: "/category/co-ord-sets"
    },
    secondaryCta: {
      label: "View All Pieces",
      href: "/shop"
    },
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
    featuredPiece: {
      title: "FESTIVE FAVORITE",
      subtitle: "Dusty Lavender Zari Co-Ord • ₹5,450",
      href: "/shop",
      tag: "TRENDING"
    }
  }
];

function transformRawSlides(heroData: any): HeroSlide[] {
  if (!heroData) return DEFAULT_SLIDES;

  // 1. If explicit heroSlides or slides array exists
  const rawList: any[] = Array.isArray(heroData.heroSlides)
    ? heroData.heroSlides
    : Array.isArray(heroData.slides)
    ? heroData.slides
    : [];

  if (rawList.length > 0) {
    const activeList = rawList.filter((s) => s && s.isActive !== false);
    if (activeList.length > 0) {
      return activeList.map((s, idx) => ({
        id: s.id || `slide-${idx + 1}`,
        tag: s.eyebrow || s.tag || "FESTIVE EDIT 2026",
        headline: s.headline || "Grace In Every Thread",
        description: s.description || "",
        offerBadge: s.offerBadge || "Use Code NILASA10 for 10% Off",
        primaryCta: s.primaryCta || { label: "Explore Collection →", href: "/shop" },
        secondaryCta: s.secondaryCta || { label: "View Suit Sets", href: "/category/suits" },
        imageUrl:
          s.imageUrl ||
          "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85",
        featuredPiece: s.featuredPiece || {
          title: "SIGNATURE PIECE",
          subtitle: "Indigo Pleat Anarkali Suit • ₹6,490",
          href: "/product/indigo-pleat-anarkali-suit",
          tag: "BESTSELLER"
        }
      }));
    }
  }

  // 2. If single heroBanner object
  const banner = heroData.heroBanner || heroData;
  if (banner && banner.isActive !== false) {
    return [
      {
        id: "slide-admin-1",
        tag: banner.eyebrow || "FESTIVE EDIT 2026",
        headline: banner.headline || "Grace In Every Thread",
        description: banner.description || "",
        offerBadge: banner.offerBadge || "Use Code NILASA10 for 10% Off",
        primaryCta: banner.primaryCta || { label: "Explore Collection →", href: "/shop" },
        secondaryCta: banner.secondaryCta || { label: "View Suit Sets", href: "/category/suits" },
        imageUrl:
          banner.imageUrl ||
          "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85",
        featuredPiece: banner.featuredPiece || {
          title: "SIGNATURE PIECE",
          subtitle: "Indigo Pleat Anarkali Suit • ₹6,490",
          href: "/product/indigo-pleat-anarkali-suit",
          tag: "BESTSELLER"
        }
      },
      DEFAULT_SLIDES[1],
      DEFAULT_SLIDES[2]
    ];
  }

  return DEFAULT_SLIDES;
}

export function HeroCarousel({ initialHero }: { initialHero?: any }) {
  const [slides, setSlides] = useState<HeroSlide[]>(() => transformRawSlides(initialHero));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync client-side when updated in Admin Panel (via storage or custom event)
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = window.localStorage.getItem("nilasa-banners-config");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed) {
            setSlides(transformRawSlides(parsed));
          }
        }
      } catch {
        // fallback
      }
    };

    handleSync();

    const handleCustomEvent = (e: any) => {
      if (e.detail) {
        setSlides(transformRawSlides(e.detail));
      }
    };

    window.addEventListener("nilasa-banners-updated", handleCustomEvent);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("nilasa-banners-updated", handleCustomEvent);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-play timer
  useEffect(() => {
    if (!isPaused && totalSlides > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, totalSlides]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const activeIndex = Math.min(currentIndex, Math.max(0, totalSlides - 1));
  const currentSlide = slides[activeIndex] || DEFAULT_SLIDES[0];

  return (
    <div
      className="hero-carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Nilasa Featured Hero Collections"
    >
      <div className="hero-carousel-slide">
        {/* Left Content Zone */}
        <div className="hero-carousel-copy">
          {/* Tag & Offer Badges */}
          <div className="hero-badge-group">
            <span className="hero-luxury-tag">
              <Sparkles size={13} className="sparkle-icon" />
              <span>{currentSlide.tag}</span>
            </span>

            {currentSlide.offerBadge && (
              <span className="hero-offer-pill">
                <Tag size={12} />
                <span>{currentSlide.offerBadge}</span>
              </span>
            )}
          </div>

          {/* Heading */}
          <h1 className="hero-carousel-title" key={`title-${currentSlide.id}-${activeIndex}`}>
            {currentSlide.headline}
          </h1>

          {/* Description */}
          <p className="hero-carousel-desc" key={`desc-${currentSlide.id}-${activeIndex}`}>
            {currentSlide.description}
          </p>

          {/* CTA Button Group */}
          <div className="hero-cta-group">
            <Link
              href={currentSlide.primaryCta.href}
              className="button button--gold button--large hero-primary-btn"
            >
              <span>{currentSlide.primaryCta.label}</span>
            </Link>

            <Link
              href={currentSlide.secondaryCta.href}
              className="button button--indigo button--large hero-secondary-btn"
            >
              <span>{currentSlide.secondaryCta.label}</span>
            </Link>
          </div>

          {/* Trust Highlights Micro-Strip (Myntra/Ajio Luxe Style) */}
          <div className="hero-trust-strip">
            <div className="hero-trust-item">
              <Star size={13} className="hero-trust-star" />
              <span>4.9/5 Artisanal Rating</span>
            </div>
            <span className="hero-trust-dot">•</span>
            <div className="hero-trust-item">
              <ShieldCheck size={13} className="hero-trust-icon" />
              <span>100% Pure Silk</span>
            </div>
            <span className="hero-trust-dot">•</span>
            <div className="hero-trust-item">
              <Truck size={13} className="hero-trust-icon" />
              <span>Free Express Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Media Frame */}
        <div className="hero-carousel-media">
          <div className="hero-media-backdrop-glow" />
          <div className="hero-media-frame">
            <Image
              key={`${currentSlide.imageUrl}-${activeIndex}`}
              src={currentSlide.imageUrl}
              alt={currentSlide.headline}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="hero-image-zoom"
            />

            {/* Top Trending Badge */}
            {currentSlide.featuredPiece?.tag && (
              <div className="hero-top-badge">
                <span>{currentSlide.featuredPiece.tag}</span>
              </div>
            )}

            {/* Floating Luxury Showcase Card */}
            {currentSlide.featuredPiece && (
              <Link
                href={currentSlide.featuredPiece.href}
                className="hero-floating-card-luxe"
              >
                <div>
                  <span className="floating-card-title">
                    {currentSlide.featuredPiece.title}
                  </span>
                  <span className="floating-card-subtitle">
                    {currentSlide.featuredPiece.subtitle}
                  </span>
                </div>
                <div className="floating-card-arrow">
                  <ArrowRight size={14} />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls: Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="hero-nav-arrow hero-nav-arrow--prev"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="hero-nav-arrow hero-nav-arrow--next"
            aria-label="Next Slide"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Bottom Dot & Progress Indicators */}
      {totalSlides > 1 && (
        <div className="hero-carousel-dots" role="tablist">
          {slides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Go to slide ${idx + 1}: ${slide.headline}`}
              onClick={() => setCurrentIndex(idx)}
              className={`hero-dot-btn ${idx === activeIndex ? "hero-dot-btn--active" : ""}`}
            >
              <span className="hero-dot-fill" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
