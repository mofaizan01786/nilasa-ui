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

  // 1. Read local orders store (instant, 100% reliable)
  const localOrders = readOrders();

  // 2. Fetch remote backend orders if available
  let backendOrders: any[] = [];
  try {
    backendOrders = await fetchOrdersAdmin(status);
  } catch {
    // ignore
  }

  // 3. Merge orders uniquely by orderId (local orders have highest priority)
  const orderMap = new Map();
  for (const o of localOrders) {
    orderMap.set(o.orderId || o.id, o);
  }
  for (const o of backendOrders) {
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
