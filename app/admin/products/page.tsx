import { fetchAllProductsAdmin, fetchCategories } from "@/lib/dotnet-backend";
import { AdminProductsClient } from "@/components/admin/AdminProductsClient";

export const dynamic = "force-dynamic"; // SSR for live admin inventory

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [products, categories] = await Promise.all([
    fetchAllProductsAdmin(status),
    fetchCategories()
  ]);

  return (
    <AdminProductsClient
      initialProducts={products}
      categories={categories}
      currentStatusFilter={status}
    />
  );
}
