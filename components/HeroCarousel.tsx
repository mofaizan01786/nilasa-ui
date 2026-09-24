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
  Tag,
  Flame,
  Crown,
  RotateCcw,
  Percent
} from "lucide-react";

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

export interface QuickSpotlightCard {
  id: string;
  eyebrow: string;
  title: string;
  offer: string;
  subtitle: string;
  imageUrl: string;
  href: string;
  badge?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    tag: "FESTIVE COUTURE 2026",
    headline: "Grace In Every Thread",
    subheadline: "Royal Zari & Pure Silk Couture",
    description:
      "Handcrafted Indian ethnic wear tailored with timeless poise. Royal Chanderi silks, opulent zari woven Anarkalis, and artisanal suit sets.",
    offerBadge: "🔥 Festive Sale • Up to 40% Off",
    primaryCta: {
      label: "Shop Festive Edit →",
      href: "/shop"
    },
    secondaryCta: {
      label: "Explore Suit Sets",
      href: "/category/suits"
    },
    imageUrl:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85",
    featuredPiece: {
      title: "SIGNATURE ATELIER",
      subtitle: "Crimson Royal Zari Anarkali • ₹6,490",
      href: "/shop?category=suits",
      tag: "BESTSELLER"
    }
  },
  {
    id: "slide-2",
    tag: "HERITAGE HANDLOOM WEAVES",
    headline: "Timeless Heritage Weaves",
    subheadline: "Pure Zari & Tissue Silk",
    description:
      "Intricate gold zari motifs woven on handloom looms by master artisans. Draped in regal festive hues for weddings and celebratory soirées.",
    offerBadge: "⚡ Use Code NILASA10 for 10% Off",
    primaryCta: {
      label: "Shop Handloom Silks →",
      href: "/category/suits"
    },
    secondaryCta: {
      label: "Discover Kurtis",
      href: "/category/kurtis"
    },
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85",
    featuredPiece: {
      title: "HERITAGE EDITION",
      subtitle: "Rose Tissue Silk Kurta Set • ₹7,990",
      href: "/category/suits",
      tag: "NEW ARRIVAL"
    }
  },
  {
    id: "slide-3",
    tag: "ARTISANAL DUPATTAS & WEAVES",
    headline: "Heirloom Silks & Fine Weaves",
    subheadline: "Handcrafted in Limited Artisanal Batches",
    description:
      "Exquisite handcrafted dupattas and unstitched dress materials in pure tissue, organza, and Varanasi silks. Each piece is a wearable masterpiece.",
    offerBadge: "🚚 Free Express Shipping Nationwide",
    primaryCta: {
      label: "Explore Dupattas →",
      href: "/category/dupattas"
    },
    secondaryCta: {
      label: "Unstitched Suits",
      href: "/category/unstitched-suits"
    },
    imageUrl:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85",
    featuredPiece: {
      title: "LIMITED BATCH",
      subtitle: "Banarasi Tissue Zari Dupatta • ₹2,490",
      href: "/category/dupattas",
      tag: "TRENDING"
    }
  },
  {
    id: "slide-4",
    tag: "CONTEMPORARY ETHNIC CO-ORDS",
    headline: "Modern Minimalist Poise",
    subheadline: "Effortless Everyday Grace",
    description:
      "Effortlessly elegant co-ord sets crafted from breathable natural linen and modal silks. Transition seamlessly from daytime desk wear to grand evenings.",
    offerBadge: "💎 Flat 15% Off On Co-Ords",
    primaryCta: {
      label: "Shop Co-Ord Sets →",
      href: "/category/co-ord-sets"
    },
    secondaryCta: {
      label: "View All Collections",
      href: "/shop"
    },
    imageUrl:
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1600&q=85",
    featuredPiece: {
      title: "FESTIVE FAVORITE",
      subtitle: "Twilight Lavender Silk Co-Ord • ₹5,450",
      href: "/category/co-ord-sets",
      tag: "HOT PICK"
    }
  }
];

const SPOTLIGHT_CARDS: QuickSpotlightCard[] = [
  {
    id: "spotlight-1",
    eyebrow: "BESTSELLING COUTURE",
    title: "Royal Suits & Anarkalis",
    offer: "Up to 35% Off",
    subtitle: "From ₹3,990 • Pure Silks",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
    href: "/shop?category=suits",
    badge: "🔥 TOP PICK"
  },
  {
    id: "spotlight-2",
    eyebrow: "NEW SEASON",
    title: "Handloom Kurtis & Tunics",
    offer: "Min. 25% Off",
    subtitle: "Under ₹2,499 • Breathable",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
    href: "/shop?category=kurtis",
    badge: "✨ NEW"
  },
  {
    id: "spotlight-3",
    eyebrow: "HERITAGE WEAVES",
    title: "Artisanal Zari Dupattas",
    offer: "Flat 20% Off",
    subtitle: "From ₹1,490 • Handwoven",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
    href: "/shop?category=dupattas",
    badge: "👑 HEIRLOOM"
  },
  {
    id: "spotlight-4",
    eyebrow: "CONTEMPORARY",
    title: "Festive Co-Ords & Sets",
    offer: "Special Deal",
    subtitle: "Under ₹4,990 • Modern Fit",
    imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80",
    href: "/shop?category=co-ord-sets",
    badge: "⚡ TRENDING"
  }
];

function transformRawSlides(heroData: any): HeroSlide[] {
  if (!heroData) return DEFAULT_SLIDES;

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
        tag: s.eyebrow || s.tag || "FESTIVE COUTURE 2026",
        headline: s.headline || "Grace In Every Thread",
        subheadline: s.subheadline || s.tagPill || "",
        description: s.description || "",
        offerBadge: s.offerBadge || "🔥 Festive Sale • Up to 40% Off",
        primaryCta: s.primaryCta || { label: "Shop Festive Edit →", href: "/shop" },
        secondaryCta: s.secondaryCta || { label: "Explore Suit Sets", href: "/category/suits" },
        imageUrl:
          s.imageUrl && !s.imageUrl.includes("1485968579580") && !s.imageUrl.includes("1539109136881")
            ? s.imageUrl
            : (DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length]?.imageUrl || DEFAULT_SLIDES[0].imageUrl),
        featuredPiece: s.featuredPiece || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length]?.featuredPiece
      }));
    }
  }

  const banner = heroData.heroBanner || heroData;
  if (banner && banner.isActive !== false) {
    const validImg = banner.imageUrl && !banner.imageUrl.includes("1485968579580") && !banner.imageUrl.includes("1539109136881")
      ? banner.imageUrl
      : DEFAULT_SLIDES[0].imageUrl;

    return [
      {
        id: "slide-admin-1",
        tag: banner.eyebrow || "FESTIVE COUTURE 2026",
        headline: banner.headline || "Grace In Every Thread",
        subheadline: banner.tagPill || "",
        description: banner.description || "",
        offerBadge: banner.offerBadge || "🔥 Festive Sale • Up to 40% Off",
        primaryCta: banner.primaryCta || { label: "Shop Festive Edit →", href: "/shop" },
        secondaryCta: banner.secondaryCta || { label: "Explore Suit Sets", href: "/category/suits" },
        imageUrl: validImg,
        featuredPiece: banner.featuredPiece || DEFAULT_SLIDES[0].featuredPiece
      },
      DEFAULT_SLIDES[1],
      DEFAULT_SLIDES[2],
      DEFAULT_SLIDES[3]
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

  // Auto-play timer (Amazon / Flipkart 5.5s interval)
  useEffect(() => {
    if (!isPaused && totalSlides > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 6000);
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
    <div className="hero-section-luxe-container">
      {/* 1. Main Interactive Luxury Hero Banner */}
      <div
        className="hero-carousel-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-roledescription="carousel"
        aria-label="Nilasa Festive Hero Showcase"
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
                  <Flame size={13} className="hero-flame-icon" />
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

            {/* Trust Highlights Micro-Strip (Amazon/Myntra Luxe Grade) */}
            <div className="hero-trust-strip">
              <div className="hero-trust-item">
                <Star size={13} className="hero-trust-star" />
                <span>4.9/5 Rating (1.2k+ Reviews)</span>
              </div>
              <span className="hero-trust-dot">•</span>
              <div className="hero-trust-item">
                <ShieldCheck size={13} className="hero-trust-icon" />
                <span>100% Certified Pure Silk</span>
              </div>
              <span className="hero-trust-dot">•</span>
              <div className="hero-trust-item">
                <Truck size={13} className="hero-trust-icon" />
                <span>Free Express Shipping</span>
              </div>
              <span className="hero-trust-dot">•</span>
              <div className="hero-trust-item">
                <RotateCcw size={13} className="hero-trust-icon" />
                <span>7-Day Easy Exchange</span>
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
                  <Crown size={12} style={{ display: "inline-block", marginRight: 4 }} />
                  <span>{currentSlide.featuredPiece.tag}</span>
                </div>
              )}

              {/* Floating Luxury Showcase Card */}
              {currentSlide.featuredPiece && (
                <Link
                  href={currentSlide.featuredPiece.href}
                  className="hero-floating-card-luxe"
                >
                  <div className="floating-card-info">
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

      {/* 2. Amazon / Flipkart Style Quick Category & Deal Spotlight Cards */}
      <section className="hero-spotlight-section shell" aria-label="Featured Categories and Deals">
        <div className="hero-spotlight-grid">
          {SPOTLIGHT_CARDS.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="hero-spotlight-card"
            >
              <div className="spotlight-card-content">
                {card.badge && (
                  <span className="spotlight-badge">
                    {card.badge}
                  </span>
                )}
                <span className="spotlight-eyebrow">{card.eyebrow}</span>
                <h3 className="spotlight-title">{card.title}</h3>
                <div className="spotlight-deal-tag">
                  <Percent size={12} />
                  <span>{card.offer}</span>
                </div>
                <p className="spotlight-subtitle">{card.subtitle}</p>
                <span className="spotlight-cta">
                  <span>Shop Now</span>
                  <ArrowRight size={13} className="spotlight-cta-arrow" />
                </span>
              </div>
              <div className="spotlight-card-image-wrap">
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  sizes="160px"
                  className="spotlight-card-image"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
