import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireRole } from "@/lib/auth";
import { formatDatabaseTime, formatJakartaDate } from "@/lib/date-display";
import { prisma } from "@/lib/prisma";

export default async function MahasiswaAgendaPage() {
  const mahasiswa = await requireRole("MAHASISWA");
  const schedules = await prisma.ujianTa.findMany({
    where: { tugasAkhir: { mahasiswaId: mahasiswa.id } },
    include: { ruangan: true },
    orderBy: [{ tanggal: "asc" }, { jamMulai: "asc" }],
  });
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-6 sm:p-10">
    <PageHeader eyebrow="AKADEMIK" title="Agenda" description="Jadwal seminar dan sidang." />
    <section className="editorial-section">{schedules.length ? <div className="space-y-3">{schedules.map((item) => <article key={item.id} className="schedule-entry"><h2 className="font-semibold">{item.jenis.replaceAll("_", " ")}</h2><p className="schedule-date">{formatJakartaDate(item.tanggal)} · {formatDatabaseTime(item.jamMulai)}–{formatDatabaseTime(item.jamSelesai)}</p><p>{item.ruangan.kode} — {item.ruangan.nama}, {item.ruangan.lokasi}</p><p className="text-sm text-slate-600"><StatusBadge status={item.status} /></p></article>)}</div> : <p className="text-slate-600">Belum ada agenda.</p>}</section>
  </main>;
}
