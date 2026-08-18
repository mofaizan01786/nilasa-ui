import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchCategories, fetchPublishedProducts, fetchProductFilters } from "@/lib/api";
import ShopClient from "@/app/shop/ShopClient";

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

  const [categories, allProducts, filters] = await Promise.all([
    fetchCategories(),
    fetchPublishedProducts(),
    fetchProductFilters()
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const categoryProducts = allProducts.filter(
    (p) => p.categoryId === category.id || p.categorySlug === category.slug || p.categoryName?.toLowerCase() === category.name.toLowerCase()
  );

  return (
    <main className="shop-page-wrapper">
      <ShopClient
        initialProducts={categoryProducts}
        categories={categories}
        initialFilters={filters}
        categoryTitle={category.name}
        categoryDesc={category.description || `The perfect look for a modern woman - discover the collection of ${category.name}.`}
        fixedCategory={category.slug}
      />
    </main>
  );
}
