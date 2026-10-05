import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusAktif } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { formatDatabaseTime, formatJakartaDate } from "@/lib/date-display";
import { prisma } from "@/lib/prisma";

export default async function DosenJadwalPage() {
  const dosen = await requireRole("DOSEN");
  const schedules = await prisma.ujianTa.findMany({
    where: { tugasAkhir: { pembimbing: { some: { dosenId: dosen.id, status: StatusAktif.ACTIVE } } } },
    include: { ruangan: true, tugasAkhir: { include: { mahasiswa: { select: { nama: true, nimNip: true } } } } },
    orderBy: [{ tanggal: "asc" }, { jamMulai: "asc" }],
  });
  return <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-6 sm:p-10"><PageHeader eyebrow="RUANG PEMBIMBING" title="Jadwal Saya" description="Agenda seminar dan sidang mahasiswa bimbingan. Hanya baca." /><section className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-5"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Mahasiswa</th><th className="p-2">Jenis</th><th className="p-2">Tanggal & jam</th><th className="p-2">Ruangan</th><th className="p-2">Status</th></tr></thead><tbody>{schedules.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="p-2">{item.tugasAkhir.mahasiswa.nama}<br/><span className="text-slate-500">{item.tugasAkhir.mahasiswa.nimNip}</span></td><td className="p-2">{item.jenis}</td><td className="p-2">{formatJakartaDate(item.tanggal)} · {formatDatabaseTime(item.jamMulai)}–{formatDatabaseTime(item.jamSelesai)}</td><td className="p-2">{item.ruangan.kode}</td><td className="p-2"><StatusBadge status={item.status} /></td></tr>)}</tbody></table>{!schedules.length ? <p className="py-4 text-slate-600">Belum ada jadwal untuk bimbingan aktif Anda.</p> : null}</section></main>;
}
