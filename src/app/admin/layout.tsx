import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/auth";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <AppShell role="ADMIN" nama={user.nama} email={user.email}>{children}</AppShell>;
}
