import { fetchPublishedProducts, fetchCategories } from "@/lib/api";
import { getBannersDirect } from "@/lib/siteData";
import { EditorialHero } from "@/components/EditorialHero";
import { NilasaStorySlider } from "@/components/NilasaStorySlider";
import { NilasaDualBanners } from "@/components/NilasaDualBanners";
import { NilasaCollectionGrid } from "@/components/NilasaCollectionGrid";
import { NilasaCollectionTabs } from "@/components/NilasaCollectionTabs";
import { NilasaAtelierStory } from "@/components/NilasaAtelierStory";
import { NilasaRunwayMarquee } from "@/components/NilasaRunwayMarquee";
import { TestimonialSlider } from "@/components/TestimonialSlider";

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

      {/* 2. Nilasa 3-Card Curated Stories Slider */}
      <NilasaStorySlider />

      {/* 3. Nilasa 2-Column Split Image Banners */}
      <NilasaDualBanners />

      {/* 4. Nilasa Category Collection Grid */}
      <NilasaCollectionGrid categories={categories} />

      {/* 5. Nilasa Editorial Rich Text Quote */}
      <section className="nilasa-rich-text shell" aria-label="Editorial Note">
        <p className="nilasa-rich-text__quote">
          “A glimpse into the world of modern Indian elegance. Thoughtfully cut silhouettes, pure handloom weaves, and quiet luxury for the modern woman.”
        </p>
      </section>

      {/* 6. Nilasa Interactive Collection Tabs with Quick Size Drawer */}
      <NilasaCollectionTabs products={products} />

      {/* 7. Nilasa Parallax Atelier Story */}
      <NilasaAtelierStory />

      {/* 8. Nilasa Runway Photo Marquee */}
      <NilasaRunwayMarquee />

      {/* 9. Nilasa Customer Reviews & Social Proof */}
      <TestimonialSlider />
    </main>
  );
}
