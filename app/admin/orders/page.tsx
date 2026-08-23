import { fetchOrdersAdmin } from "@/lib/dotnet-backend";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let backendOrders: any[] = [];
  try {
    backendOrders = await fetchOrdersAdmin(status);
  } catch {
    backendOrders = [];
  }

  return <AdminOrdersClient orders={backendOrders} currentStatusFilter={status} />;
}
