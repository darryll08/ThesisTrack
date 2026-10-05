import { RoleHome } from "@/components/shared/role-home";
import { requireRole } from "@/lib/auth";

export default async function KoordinatorPage() {
  const user = await requireRole("KOORDINATOR");
  return (
    <RoleHome
      title="Koordinator TA Dashboard"
      user={user}
      links={[
        { href: "/koordinator/tugas-akhir", label: "Kelola Tugas Akhir" },
        { href: "/koordinator/jadwal", label: "Jadwal Ujian" },
        { href: "/koordinator/monitoring", label: "Monitoring" },
        { href: "/koordinator/analytics", label: "Analytics" },
      ]}
    />
  );
}
