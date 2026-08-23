import { Product } from "./types";

export type { Product };

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://nilasabackend.geecera.com/api/v1";

export const CATEGORIES = [
  { slug: "suits", name: "Suits", description: "Tailored suit sets with ornate zari & embroidery details.", icon: "suit" },
  { slug: "kurtis", name: "Kurtis", description: "Timeless silhouettes designed for everyday luxury and repeat wear.", icon: "kurti" },
  { slug: "co-ord-sets", name: "Co-Ord Sets", description: "Harmonious two-piece ensembles with fluid lines and modern comfort.", icon: "coord" },
  { slug: "unstitched-suits", name: "Unstitched Suits", description: "Premium unstitched dress materials tailored to your unique style.", icon: "unstitched" },
  { slug: "dupattas", name: "Dupattas", description: "Handcrafted dupattas in silk, chiffon, and zari tissue.", icon: "dupatta" },
  { slug: "lehengas", name: "Lehengas", description: "Sculptural festive lehengas woven with intricate heritage motifs.", icon: "lehenga" }
];

export async function getProducts(): Promise<Product[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${API_URL}/products`, {
      next: { revalidate: 60 },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) return [];
    const products = (await response.json()) as Product[];
    if (Array.isArray(products)) {
      return products.map(p => ({
        ...p,
        id: p.productId ?? p.id,
        imageUrl: p.imageUrl || p.images?.[0]?.imageUrl || undefined,
        variants: p.variants ?? [],
        images: p.images ?? []
      }));
    }
  } catch {
    // Backend offline during build or dev
  }
  return [];
}

export function getBackendStorageBase(): string {
  const customStorage = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.STORAGE_URL;
  if (customStorage) {
    return customStorage.replace(/\/+$/, "");
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "";
  if (!apiUrl) return "";
  try {
    const parsed = new URL(apiUrl.startsWith("http") ? apiUrl : `https://${apiUrl}`);
    return parsed.origin;
  } catch {
    return apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }
}

export function resolveProductImageUrl(url?: string): string {
  if (!url) return "";
  const storageBase = getBackendStorageBase();

  // External CDN images like Unsplash or Cloudinary (without /uploads/)
  if ((url.startsWith("http://") || url.startsWith("https://")) && !url.includes("/uploads/")) {
    return url;
  }

  // Any backend uploaded asset (relative /uploads/ or mismatched domain/uploads/)
  if (url.includes("/uploads/")) {
    const uploadPath = url.split("/uploads/")[1];
    return storageBase ? `${storageBase}/uploads/${uploadPath}` : `/uploads/${uploadPath}`;
  }

  if (url.startsWith("/")) {
    return url;
  }

  return storageBase ? `${storageBase}/${url}` : url;
}

export function getProductImage(product: Product, variant = 0): string {
  if (product.images && product.images.length > 0) {
    const sorted = [...product.images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = variant % sorted.length;
    const resolved = resolveProductImageUrl(sorted[idx]?.imageUrl);
    if (resolved) return resolved;
  }
  const fallback = resolveProductImageUrl(product.imageUrl);
  if (fallback) return fallback;

  return "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85";
}

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
    (p.categorySlug && p.categorySlug.toLowerCase().includes(q)) ||
    (p.fabric && p.fabric.toLowerCase().includes(q)) ||
    (p.color && p.color.toLowerCase().includes(q)) ||
    (p.badge && p.badge.toLowerCase().includes(q)) ||
    (p.description && p.description.toLowerCase().includes(q))
  );
}

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
