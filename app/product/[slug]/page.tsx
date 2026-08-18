import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBag } from "@/components/AddToBag";
import { ProductGallery } from "@/components/ProductGallery";
import { fetchPublishedProducts, fetchProductBySlug } from "@/lib/api";
import { formatPrice, getProductImage } from "@/lib/catalog";

export const revalidate = 3600; // ISR cache strategy

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

    let product = await fetchProductBySlug(slug);
    if (!product) {
      const all = await fetchPublishedProducts();
      product = all.find((p) => p.slug === slug || encodeURIComponent(p.slug) === slug) || null;
    }
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

  let product = await fetchProductBySlug(slug);
  if (!product) {
    const all = await fetchPublishedProducts();
    product = all.find((p) => p.slug === slug || encodeURIComponent(p.slug) === slug) || null;
  }
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
    </main>
  );
}
