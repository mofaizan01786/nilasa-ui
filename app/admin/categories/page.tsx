import { fetchCategories } from "@/lib/api";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";

export const dynamic = "force-dynamic"; // SSR page for fresh category data

export default async function AdminCategoriesPage() {
  const categories = await fetchCategories();

  return <AdminCategoriesClient categories={categories} />;
}
