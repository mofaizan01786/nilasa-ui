import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBag } from "@/components/AddToBag";
import { ProductGallery } from "@/components/ProductGallery";
import { fetchPublishedProducts, fetchProductBySlug, fetchProductsPaged } from "@/lib/dotnet-backend";
import { formatPrice, getProductImage } from "@/lib/catalog";
import { ProductReviewsSection } from "@/components/ProductReviewsSection";
import { Star } from "lucide-react";
import { Product } from "@/lib/types";

export const revalidate = 3600; // ISR cache strategy

async function resolveProduct(slug: string): Promise<Product | null> {
  // 1. Direct slug lookup
  let product = await fetchProductBySlug(slug);
  if (product) return product;

  // 2. Lookup by keyword search from slug
  try {
    const cleanSearch = slug.replace(/-[0-9]+$/, "").replace(/-/g, " ");
    const searchRes = await fetchProductsPaged({ search: cleanSearch }, 1, 15);
    if (searchRes?.items?.length) {
      const match =
        searchRes.items.find(
          (p) =>
            p.slug.toLowerCase() === slug.toLowerCase() ||
            p.slug.toLowerCase().startsWith(slug.toLowerCase()) ||
            slug.toLowerCase().startsWith(p.slug.toLowerCase()) ||
            p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug.toLowerCase()
        ) || searchRes.items[0];
      if (match) return match;
    }
  } catch {
    // fallback
  }

  // 3. Fallback scan across catalog
  try {
    const all = await fetchPublishedProducts({ pageSize: 100 });
    const match =
      all.find(
        (p) =>
          p.slug.toLowerCase() === slug.toLowerCase() ||
          p.slug.toLowerCase().startsWith(slug.toLowerCase()) ||
          slug.toLowerCase().startsWith(p.slug.toLowerCase()) ||
          p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug.toLowerCase()
      ) || null;
    if (match) return match;
  } catch {
    // fallback
  }

  return null;
}

export async function generateStaticParams() {
  const products = await fetchPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.slug;
    if (!slug) return {};

    const product = await resolveProduct(slug);
    if (!product) return {};

    const url = `https://nilasawear.com/product/${product.slug}`;
    const image = getProductImage(product);

    return {
      title: `${product.name} | Nilasa`,
      description: product.description || `Shop the ${product.name} from Nilasa's modern womenswear collection.`,
      alternates: { canonical: url },
      openGraph: {
        title: `${product.name} | Nilasa`,
        description: product.description || `Shop the ${product.name}.`,
        url,
        images: [{ url: image, alt: product.name }]
      }
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) notFound();

  const product = await resolveProduct(slug);
  if (!product) notFound();

  const mainImage = getProductImage(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [mainImage],
    description: product.description || `A considered Nilasa womenswear piece: ${product.name}.`,
    brand: { "@type": "Brand", name: "Nilasa" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.basePrice,
      availability: "https://schema.org/InStock",
      url: `https://nilasawear.com/product/${product.slug}`
    }
  };

  return (
    <main className="shell shop-page-container" style={{ paddingTop: "clamp(16px, 3vw, 32px)", paddingBottom: "clamp(40px, 6vw, 80px)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="product-detail-layout">
        <section className="product-images" aria-label={`${product.name} image gallery`}>
          <ProductGallery
            productName={product.name}
            images={product.images || []}
            fallbackUrl={mainImage}
          />
        </section>

        <section className="product-info">
          <p className="breadcrumb" style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--ink-muted)", marginBottom: 12 }}>
            <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <span>{product.name}</span>
          </p>

          <span className={`product-card__badge ${product.badgeType === "lavender" ? "badge--lavender" : "badge--gold"}`} style={{ position: "static", width: "fit-content", marginBottom: 14 }}>
            {product.badge || "Artisanal Luxury"}
          </span>

          <h1 className="product-detail-title">
            {product.name}
          </h1>

          {/* Customer Reviews summary badge & anchor */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 12px" }}>
            <Link
              href="#reviews"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                textDecoration: "none",
                fontSize: "13px",
                color: "var(--ink-muted)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    fill={Number(product.averageRating || 5) >= s ? "#D97706" : "#E5E7EB"}
                    color={Number(product.averageRating || 5) >= s ? "#D97706" : "#E5E7EB"}
                  />
                ))}
              </div>
              <span style={{ fontWeight: 600, color: "var(--ink-primary)" }}>
                {product.averageRating ? Number(product.averageRating).toFixed(1) : "5.0"}
              </span>
              <span style={{ color: "var(--nilasa-gold)", textDecoration: "underline" }}>
                ({product.reviewCount || 0} reviews)
              </span>
            </Link>
          </div>

          <p className="product-detail-price">
            {formatPrice(product.basePrice)}
          </p>

          <div className="product-description" style={{ fontSize: "0.95rem", color: "var(--ink-muted)", marginBottom: 24, lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>{product.description || "Ease, shape and softness come together in this versatile Nilasa piece. Crafted for quiet confidence and repeated wear."}</p>
            {product.fabric && <p style={{ marginTop: 8, marginBottom: 0 }}><strong>Fabric & Weave:</strong> {product.fabric}</p>}
            <p className="meta" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--nilasa-indigo)", marginTop: 12, marginBottom: 0 }}>
              ✨ Inclusive of all taxes • Free complimentary shipping across India
            </p>
          </div>

          <AddToBag product={product} />
        </section>
      </div>

      {/* ── Verified Customer Ratings & Reviews Section ── */}
      <ProductReviewsSection
        productId={product.productId || (typeof product.id === "number" ? product.id : 1)}
        productName={product.name}
        productSlug={product.slug}
      />
    </main>
  );
}
