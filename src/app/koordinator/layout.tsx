import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("KOORDINATOR");
  return <AppShell role="KOORDINATOR" nama={user.nama} email={user.email}>{children}</AppShell>;
}
