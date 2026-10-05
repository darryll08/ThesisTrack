import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ThesisProgressTrack } from "@/components/shared/thesis-progress-track";
import { deriveRoadmap } from "@/lib/phase5";
import { formatJakartaDate, formatDatabaseTime } from "@/lib/date-display";

export default async function MahasiswaPage() {
  const user = await requireRole("MAHASISWA");
  const findTa = (status: ("DRAFT" | "ACTIVE" | "COMPLETED")[]) => prisma.tugasAkhir.findFirst({
    where: { mahasiswaId: user.id, status: { in: status } },
    include: { milestones: { orderBy: { urutan: "asc" } }, pembimbing: { where: { status: "ACTIVE" }, orderBy: { urutan: "asc" }, include: { dosen: { select: { nama: true } } } }, dokumen: { orderBy: { uploadedAt: "desc" }, take: 3 }, ujian: { orderBy: [{ tanggal: "asc" }, { jamMulai: "asc" }] } },
    orderBy: { createdAt: "desc" },
  });
  const ta = await findTa(["DRAFT", "ACTIVE"]) ?? await findTa(["COMPLETED"]);
  const tasks = await prisma.personalTask.findMany({ where: { pemilikId: user.id }, orderBy: { updatedAt: "desc" }, take: 3 });
  const bimbingan = ta ? await prisma.bimbingan.findMany({ where: { pembimbing: { tugasAkhirId: ta.id } }, orderBy: { submittedAt: "desc" }, take: 3, include: { taMilestone: true } }) : [];
  const roadmap = ta ? deriveRoadmap(ta.milestones) : null;
  return <main>
    <PageHeader eyebrow="MAHASISWA" title="Ringkasan akademik" description={`Informasi tugas akhir untuk ${user.nama}.`} />
    {ta ? <section className="student-overview"><div className="student-overview-heading"><div><div className="flex flex-wrap items-center gap-3"><StatusBadge status={ta.status}/><span className="context-label">TUGAS AKHIR</span></div><h2 className="dashboard-title">{ta.judulFinal ?? "Judul final belum ditetapkan"}</h2></div><div className="current-stage"><small>ITEM ROADMAP BERIKUTNYA</small><strong>{roadmap?.next ?? "Belum ada roadmap"}</strong></div></div><div className="supervisor-line"><span>Pembimbing</span><p>{ta.pembimbing.length ? ta.pembimbing.map((item) => item.dosen.nama).join(" · ") : "Belum ditetapkan"}</p></div><ThesisProgressTrack milestones={ta.milestones}/><Link className="action-link overview-link" href="/mahasiswa/tugas-akhir">Kelola roadmap ↗</Link></section> : <section className="editorial-section"><h2>Belum ada tugas akhir</h2><p>Mulai tugas akhir dan ajukan topik melalui halaman Tugas Akhir.</p><Link className="action-link" href="/mahasiswa/tugas-akhir">Buka tugas akhir ↗</Link></section>}
    <div className="dashboard-split"><section className="editorial-section"><h2>Bimbingan terbaru</h2>{bimbingan.length ? bimbingan.map(item => <div className="activity-row" key={item.id}><div><strong>{item.taMilestone?.nama ?? "Tanpa item roadmap"}</strong><small>{item.topik}</small></div><StatusBadge status={item.status}/></div>) : <p className="text-slate-500">Belum ada riwayat bimbingan.</p>}<Link className="action-link mt-4" href="/mahasiswa/bimbingan">Buka bimbingan ↗</Link></section><section className="editorial-section"><h2>Agenda</h2>{ta?.ujian.length ? ta.ujian.slice(0,3).map(item => <div className="activity-row" key={item.id}><div><strong>{formatJakartaDate(item.tanggal)}</strong><small>{item.jenis.replaceAll("_"," ")} · {formatDatabaseTime(item.jamMulai)} WIB</small></div><StatusBadge status={item.status}/></div>) : <p className="text-slate-500">Belum ada jadwal seminar atau sidang.</p>}<Link className="action-link mt-4" href="/mahasiswa/agenda">Lihat agenda ↗</Link></section><section className="editorial-section"><h2>Dokumen terbaru</h2>{ta?.dokumen.length ? ta.dokumen.map(item => <div className="activity-row" key={item.id}><div>{item.namaFile}<small>{item.jenis} · Versi {item.versi}</small></div><StatusBadge status={item.status}/></div>) : <p className="text-slate-500">Belum ada dokumen.</p>}<Link className="action-link mt-4" href="/mahasiswa/dokumen">Buka dokumen ↗</Link></section><section className="editorial-section"><h2>Workspace</h2>{tasks.length ? tasks.map(item => <div className="activity-row" key={item.id}><span>{item.nama}</span><StatusBadge status={item.status}/></div>) : <p className="text-slate-500">Belum ada task pribadi.</p>}<Link className="action-link mt-4" href="/mahasiswa/workspace">Buka workspace ↗</Link></section></div>
  </main>;
}
