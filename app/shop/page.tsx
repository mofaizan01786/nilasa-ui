import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchPublishedProducts, fetchCategories } from "@/lib/api";
import ShopClient from "./ShopClient";

export const revalidate = 3600; // ISR cache strategy

export const metadata: Metadata = {
  title: "Shop All Collections | Nilasa",
  description: "Browse Nilasa's full collection of Indian ethnic wear, suit sets, kurtis, co-ord sets, and dupattas."
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    fetchPublishedProducts(),
    fetchCategories()
  ]);

  return (
    <main className="shop-page-wrapper">
      <Suspense fallback={<div className="empty-cart-state" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading products...</div>}>
        <ShopClient initialProducts={products} categories={categories} />
      </Suspense>
    </main>
  );
}
