import { fetchAllProductsAdmin, fetchOrdersAdmin, fetchCouponsAdmin, fetchUsersAdmin } from "@/lib/dotnet-backend";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products = [], orders = [], coupons = [], users = []] = await Promise.all([
    fetchAllProductsAdmin().catch(() => []),
    fetchOrdersAdmin().catch(() => []),
    fetchCouponsAdmin().catch(() => []),
    fetchUsersAdmin().catch(() => [])
  ]);

  return (
    <AdminDashboardOverview
      initialProducts={products}
      initialOrders={orders}
      initialCoupons={coupons}
      initialUsers={users}
    />
  );
}
