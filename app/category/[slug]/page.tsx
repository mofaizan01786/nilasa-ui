import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchCategories, fetchPublishedProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 3600; // ISR cache strategy

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
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
    const categories = await fetchCategories();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return {};

    return {
      title: `${category.name} | Nilasa`,
      description: category.description || `Explore ${category.name} from Nilasa's modern ethnic womenswear collection.`,
      alternates: { canonical: `https://nilasawear.com/category/${category.slug}` }
    };
  } catch {
    return {};
  }
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) notFound();

  const [categories, allProducts] = await Promise.all([
    fetchCategories(),
    fetchPublishedProducts()
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const categoryProducts = allProducts.filter(
    (p) => p.categoryId === category.id || p.categorySlug === category.slug
  );

  return (
    <main className="shell" style={{ paddingTop: 40, paddingBottom: 100 }}>
      <header className="page-title" style={{ marginBottom: 40 }}>
        <span className="eyebrow eyebrow--gold">CATEGORY</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h2)", color: "var(--nilasa-indigo)", margin: "8px 0" }}>
          {category.name}
        </h1>
        <p style={{ color: "var(--ink-muted)", fontSize: "var(--fs-body-lead)", maxWidth: 600 }}>
          {category.description || `Handcrafted ${category.name} cut for elegance and comfort.`}
        </p>
      </header>

      {categoryProducts.length > 0 ? (
        <div className="product-grid">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-cart-state">
          <h2>No items currently in this category</h2>
          <p>Check back soon for upcoming drops.</p>
        </div>
      )}
    </main>
  );
}
