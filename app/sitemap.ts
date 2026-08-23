import { MetadataRoute } from "next";
import { fetchPublishedProducts, fetchCategories } from "@/lib/dotnet-backend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nilasawear.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchPublishedProducts();
  const categories = await fetchCategories();

  const productUrls = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    ...categoryUrls,
    ...productUrls
  ];
}
