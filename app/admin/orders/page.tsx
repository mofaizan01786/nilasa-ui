import { fetchOrdersAdmin } from "@/lib/api";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export const dynamic = "force-dynamic"; // SSR page for fresh order data

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await fetchOrdersAdmin(status);

  return <AdminOrdersClient orders={orders} currentStatusFilter={status} />;
}
