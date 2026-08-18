import { fetchCouponsAdmin } from "@/lib/api";
import { AdminCouponsClient } from "@/components/admin/AdminCouponsClient";

export const dynamic = "force-dynamic"; // SSR page for fresh coupon data

export default async function AdminCouponsPage() {
  const coupons = await fetchCouponsAdmin();

  return <AdminCouponsClient coupons={coupons} />;
}
