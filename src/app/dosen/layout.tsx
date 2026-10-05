import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("DOSEN");
  return <AppShell role="DOSEN" nama={user.nama} email={user.email}>{children}</AppShell>;
}
