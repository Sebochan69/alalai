import { getAdminComplaints } from "@/lib/api";
import { AdminMapClient } from "@/components/map/admin-map-client";

export default async function AdminMapPage() {
  const reports = await getAdminComplaints();
  const pins = reports
    .filter((r) => r.lat && r.lng)
    .map((r) => ({
      id: r.id,
      lat: r.lat!,
      lng: r.lng!,
      title: r.title ?? r.description.slice(0, 60),
      status: r.status,
      tagging: r.tagging,
      location: r.location,
      citizenName: r.citizenName,
      priority: r.priority ?? "medium",
    }));

  return <AdminMapClient pins={pins} />;
}