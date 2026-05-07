import { AdminManagementClient } from "@/components/admin-management-client";
import { getAdmins } from "@/lib/api";

export default async function ManageAdminsPage() {
  const admins = await getAdmins();
  const adminKey = admins
    .map(
      (admin) =>
        `${admin.id}:${admin.username}:${admin.email_address}:${admin.location_assigned}`,
    )
    .join("|");

  return <AdminManagementClient key={adminKey} admins={admins} />;
}
