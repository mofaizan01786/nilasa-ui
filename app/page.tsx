import Image from "next/image";
import Link from "next/link";
import { fetchPublishedProducts, fetchCategories } from "@/lib/api";
import { getBannersDirect } from "@/lib/siteData";
import { ProductCard } from "@/components/ProductCard";
import { CategoryStrip } from "@/components/CategoryStrip";
import { TrustBadges } from "@/components/TrustBadges";
import { PromotionalBanner } from "@/components/PromotionalBanner";

export const revalidate = 60; // Dynamic ISR cache strategy for storefront home

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchPublishedProducts(),
    fetchCategories()
  ]);

  const banners = getBannersDirect();
  const featuredProducts = products.slice(0, 6);
  const hero = banners?.heroBanner;

  return (
    <main>
      {/* Dynamic Hero Section */}
      {hero && hero.isActive !== false && (
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-badge-group">
              {hero.eyebrow && <span className="eyebrow eyebrow--gold">{hero.eyebrow}</span>}
              {hero.tagPill && <span className="rose-tag-pill">{hero.tagPill}</span>}
            </div>

            <h1>{hero.headline || "Grace In Every Thread"}</h1>
            <p className="hero-description">
              {hero.description ||
                "Thoughtfully cut Indian ethnic wear designed for quiet confidence. Handcrafted Chanderi silks, zari woven suit sets, and versatile separates."}
            </p>

            <div className="hero-cta-group">
              {hero.primaryCta && (
                <Link
                  href={hero.primaryCta.href || "/shop"}
                  className="button button--gold button--large"
                >
                  {hero.primaryCta.label || "Explore Collection →"}
                </Link>
              )}
              {hero.secondaryCta && (
                <Link
                  href={hero.secondaryCta.href || "/category/suits"}
                  className="button button--indigo button--large"
                >
                  {hero.secondaryCta.label || "View Suit Sets"}
                </Link>
              )}
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-media-frame">
              <Image
                src={
                  hero.imageUrl ||
                  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85"
                }
                alt={hero.headline || "Nilasa Ethnic Collection"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {hero.featuredPiece && (
              <div className="hero-floating-card">
                <span className="floating-card-title">{hero.featuredPiece.title}</span>
                <span className="floating-card-subtitle">{hero.featuredPiece.subtitle}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Strip Section */}
      <CategoryStrip categories={categories} />

      {/* Brand Craftsmanship & Color Story Section */}
      <section className="craft-section shell" style={{ margin: "40px auto 80px" }}>
        <div className="craft-card-grid">
          <div>
            <span className="eyebrow eyebrow--gold" style={{ marginBottom: 12 }}>THE NILASA COLOR PALETTE</span>
            <h2 className="craft-title" style={{ fontFamily: "var(--font-display)", margin: "8px 0 16px", color: "#FAF7F2" }}>
              In the Color of Royal Indigo & Dusty Rose
            </h2>
            <p style={{ color: "#CBD5E1", fontSize: "1.02rem", lineHeight: 1.65, marginBottom: 28 }}>
              Inspired by the heritage dyes of Northern India and the soft tones of twilight, each piece is handcrafted in Kanpur with tissue zari borders, handloom linen, and pure chiffon.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(212, 178, 88, 0.3)", padding: "12px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#202B45", border: "1px solid #B8912E" }}></span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#D4B258" }}>Royal Indigo</span>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(212, 178, 88, 0.3)", padding: "12px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#D8B4A0" }}></span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#D8B4A0" }}>Dusty Rose</span>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(212, 178, 88, 0.3)", padding: "12px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#B8912E" }}></span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#D4B258" }}>Muted Gold</span>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", height: 380, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(184, 145, 46, 0.3)" }}>
            <Image
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85"
              alt="Lavender & Indigo Heritage Embroidery Detail"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Featured SKU Grid */}
      <section className="section shell">
        <div className="section-head">
          <div>
            <span className="eyebrow eyebrow--indigo">CURATED ARRIVALS</span>
            <h2>New Collections</h2>
          </div>
          <Link href="/shop" className="text-link">
            Shop All SKUs ({products.length}) →
          </Link>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Dynamic Mid-Page Promotional Offer Banner */}
      {banners?.promotionalOfferBanner && (
        <PromotionalBanner banner={banners.promotionalOfferBanner} />
      )}

      {/* Brand Trust Indicators */}
      <TrustBadges />
    </main>
  );
}
