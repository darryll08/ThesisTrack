import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { deriveRoadmap } from "@/lib/phase5";
import { formatJakartaDate, formatDatabaseTime } from "@/lib/date-display";

export default async function DosenPage() {
  const user = await requireRole("DOSEN");
  const [students, pending, schedules] = await Promise.all([
    prisma.tugasAkhir.findMany({ where: { pembimbing: { some: { dosenId: user.id, status: "ACTIVE" } } }, include: { mahasiswa: { select: { nama: true } }, milestones: true }, orderBy: { updatedAt: "desc" } }),
    prisma.bimbingan.findMany({ where: { pembimbing: { dosenId: user.id, status: "ACTIVE" }, status: "MENUNGGU" }, include: { pembimbing: { include: { tugasAkhir: { include: { mahasiswa: { select: { nama: true } } } } } } }, orderBy: { submittedAt: "asc" }, take: 5 }),
    prisma.ujianTa.findMany({ where: { tugasAkhir: { pembimbing: { some: { dosenId: user.id, status: "ACTIVE" } } } }, include: { tugasAkhir: { include: { mahasiswa: { select: { nama: true } } } } }, orderBy: { tanggal: "asc" }, take: 3 }),
  ]);
  return <main>
    <PageHeader eyebrow="DOSEN PEMBIMBING" title="Ringkasan pembimbing" description={`Review bimbingan, mahasiswa aktif, dan jadwal untuk ${user.nama}.`}/>
    <section className="editorial-section"><div className="flex justify-between gap-4"><h2>Menunggu review</h2><Link href="/dosen/bimbingan" className="action-link">Buka review ↗</Link></div>{pending.length ? pending.map(item => <div className="activity-row" key={item.id}><div><strong>{item.pembimbing.tugasAkhir.mahasiswa.nama}</strong><small>{item.topik}</small></div><StatusBadge status={item.status}/></div>) : <p className="py-6 text-slate-500">Tidak ada permintaan yang menunggu review.</p>}</section>
    <div className="dashboard-split"><section className="editorial-section"><h2>Mahasiswa bimbingan</h2>{students.map(item => { const roadmap = deriveRoadmap(item.milestones); return <Link className="activity-row" href={`/dosen/tugas-akhir/${item.id}`} key={item.id}><div><strong>{item.mahasiswa.nama}</strong><small>{item.judulFinal ?? "Pengajuan topik"} · {roadmap.next ?? "Belum ada roadmap"}</small></div><span className="text-xl font-semibold text-blue-700">{roadmap.percentage === null ? "N/A" : `${Math.round(roadmap.percentage)}%`}</span></Link>; })}{!students.length ? <p className="text-slate-500">Belum ada assignment pembimbing aktif.</p> : null}</section><section className="editorial-section"><h2>Jadwal akademik</h2>{schedules.map(item => <div className="activity-row" key={item.id}><div><strong>{formatJakartaDate(item.tanggal)}</strong><small>{item.tugasAkhir.mahasiswa.nama}<br/>{item.jenis.replaceAll("_"," ")} · {formatDatabaseTime(item.jamMulai)} WIB</small></div><StatusBadge status={item.status}/></div>)}{!schedules.length ? <p className="text-slate-500">Belum ada jadwal untuk mahasiswa bimbingan Anda.</p> : null}<Link href="/dosen/jadwal" className="action-link mt-4">Jadwal saya ↗</Link></section></div>
  </main>;
}
