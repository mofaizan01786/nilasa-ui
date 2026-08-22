import { readOrders } from "@/lib/orders-store";
import { fetchOrdersAdmin } from "@/lib/api";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export const dynamic = "force-dynamic"; // SSR page for fresh order data

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  // 1. Fetch authoritative remote backend orders
  let backendOrders: any[] = [];
  try {
    backendOrders = await fetchOrdersAdmin(status);
  } catch {
    // ignore
  }

  // 2. Read local fallback orders store
  const localOrders = readOrders();

  // 3. Merge orders uniquely by orderId (authoritative backend orders have priority)
  const orderMap = new Map();
  for (const o of backendOrders) {
    orderMap.set(o.orderId || o.id, o);
  }
  for (const o of localOrders) {
    if (!orderMap.has(o.orderId || o.id)) {
      orderMap.set(o.orderId || o.id, o);
    }
  }

  let mergedOrders = Array.from(orderMap.values());
  if (status && status.toUpperCase() !== "ALL") {
    mergedOrders = mergedOrders.filter((o) => o.status.toLowerCase() === status.toLowerCase());
  }

  return <AdminOrdersClient orders={mergedOrders} currentStatusFilter={status} />;
}
