import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminPage() {
  await requireAdmin();

  const [pengguna, prodi, ruangan] = await Promise.all([
    prisma.pengguna.count(),
    prisma.prodi.count({ where: { status: "ACTIVE" } }),
    prisma.ruangan.count({ where: { status: "ACTIVE" } }),
  ]);

  const cards = [
    ["Pengguna", pengguna],
    ["Program Studi aktif", prodi],
    ["Ruangan aktif", ruangan],
  ] as const;

  return (
    <main>
      <PageHeader eyebrow="ADMINISTRASI SISTEM" title="Ringkasan sistem" description="Kelola akses pengguna dan fondasi data master ThesisTrack." />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <section key={label} className="editorial-section">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
