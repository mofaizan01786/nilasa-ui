import { fetchUsersAdmin } from "@/lib/dotnet-backend";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await fetchUsersAdmin(0, 100);

  return <AdminUsersClient users={users} />;
}
