import Image from "next/image";
import Link from "next/link";
import { fetchPublishedProducts, fetchCategories } from "@/lib/dotnet-backend";
import { getBannersDirect } from "@/lib/siteData";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryCircles } from "@/components/CategoryCircles";
import { TabbedProductShowcase } from "@/components/TabbedProductShowcase";
import { OccasionGrid } from "@/components/OccasionGrid";
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

  return (
    <main>
      {/* 1. Interactive Luxury Hero Carousel (Banners API) */}
      <HeroCarousel initialHero={banners} />

      {/* 2. Visual 1-Click Category Circles (Instant navigation) */}
      <CategoryCircles categories={categories} />

      {/* 3. Interactive Tabbed Product Showcase (Bestsellers / New / Festive) */}
      <TabbedProductShowcase
        products={products}
        categories={categories}
        title="Most Loved & New Curations"
        eyebrow="HANDCRAFTED ATELIER"
      />

      {/* 4. Curated Occasion & Lifestyle Merchandising Grid */}
      <OccasionGrid />

      {/* 5. Brand Craftsmanship & Color Story Section */}
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
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "#D4B258" }}>Royal Indigo</span>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(212, 178, 88, 0.3)", padding: "12px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#D8B4A0" }}></span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "#D8B4A0" }}>Dusty Rose</span>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(212, 178, 88, 0.3)", padding: "12px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#B8912E" }}></span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "#D4B258" }}>Muted Gold</span>
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

      {/* 6. Deep Category Taxonomy Catalog Grid */}
      <CategoryStrip categories={categories} />

      {/* 7. Dynamic Mid-Page Promotional Offer Banner */}
      {banners?.promotionalOfferBanner && (
        <PromotionalBanner banner={banners.promotionalOfferBanner} />
      )}

      {/* 8. Brand Trust Indicators */}
      <TrustBadges />
    </main>
  );
}
