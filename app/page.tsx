import { fetchPublishedProducts, fetchCategories } from "@/lib/api";
import { getBannersDirect } from "@/lib/siteData";
import { EditorialHero } from "@/components/EditorialHero";
import { NilasaStorySlider } from "@/components/NilasaStorySlider";
import { NilasaDualBanners } from "@/components/NilasaDualBanners";
import { NilasaCollectionGrid } from "@/components/NilasaCollectionGrid";
import { NilasaCollectionTabs } from "@/components/NilasaCollectionTabs";
import { NilasaAtelierStory } from "@/components/NilasaAtelierStory";
import { NilasaCraftsmanshipStory } from "@/components/NilasaCraftsmanshipStory";
import { NilasaRunwayMarquee } from "@/components/NilasaRunwayMarquee";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { NilasaScrollReveal } from "@/components/NilasaScrollReveal";

export const revalidate = 60; // Dynamic ISR cache strategy for storefront home

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchPublishedProducts(),
    fetchCategories()
  ]);

  const banners = getBannersDirect();
  const hero = banners?.heroBanner;

  return (
    <main className="nilasa-storefront-page">
      {/* 1. Nilasa Signature Full-Bleed Hero with Top Wordmark */}
      <EditorialHero hero={hero} />

      {/* 2. Nilasa 3-Card Curated Stories Slider (with 3D Parallax & Staggered Scroll) */}
      <NilasaStorySlider />

      {/* 3. Nilasa 2-Column Split Image Banners (with Split Scroll Entrance) */}
      <NilasaDualBanners />

      {/* 4. Nilasa Category Collection Grid (with Cascading Card Entrance) */}
      <NilasaCollectionGrid categories={categories} />

      {/* 5. Nilasa Editorial Rich Text Quote */}
      <NilasaScrollReveal animation="fade-up" duration={800}>
        <section className="nilasa-rich-text shell" aria-label="Editorial Note">
          <p className="nilasa-rich-text__quote">
            “A glimpse into the world of modern Indian elegance. Thoughtfully cut silhouettes, pure handloom weaves, and quiet luxury for the modern woman.”
          </p>
        </section>
      </NilasaScrollReveal>

      {/* 6. Nilasa Interactive Collection Tabs with Quick Size Drawer */}
      <NilasaScrollReveal animation="fade-up" duration={800}>
        <NilasaCollectionTabs products={products} />
      </NilasaScrollReveal>

      {/* 7. Nilasa Editorial Craftsmanship Story (New Luxury Heritage Section) */}
      <NilasaCraftsmanshipStory />

      {/* 8. Nilasa Parallax Atelier Story */}
      <NilasaScrollReveal animation="zoom-in" duration={900}>
        <NilasaAtelierStory />
      </NilasaScrollReveal>

      {/* 9. Nilasa Runway Photo Marquee */}
      <NilasaScrollReveal animation="fade-up" duration={800}>
        <NilasaRunwayMarquee />
      </NilasaScrollReveal>

      {/* 10. Nilasa Customer Reviews & Social Proof */}
      <NilasaScrollReveal animation="fade-up" duration={800}>
        <TestimonialSlider />
      </NilasaScrollReveal>
    </main>
  );
}
