import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { TugasAkhirStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { formatJakartaDateTime } from "@/lib/date-display";
import { deriveRisk, deriveRoadmap, latestAcademicActivity } from "@/lib/phase5";
import { prisma } from "@/lib/prisma";

export default async function MonitoringPage() {
  await requireRole("KOORDINATOR");
  const items = await prisma.tugasAkhir.findMany({
    where: { status: { not: TugasAkhirStatus.CANCELLED } },
    include: {
      mahasiswa: { include: { prodi: { select: { kode: true, nama: true } } } },
      milestones: true,
      pembimbing: { include: { bimbingan: { select: { submittedAt: true, reviewedAt: true } } } },
      dokumen: { select: { uploadedAt: true } },
      tindakLanjut: { include: { author: { select: { nama: true } } }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { mahasiswa: { nama: "asc" } },
  });
  const now = new Date();
  const rows = items.map((item) => {
    const activity = latestAcademicActivity(item.tanggalMulai, item.dokumen.map((doc) => doc.uploadedAt), item.pembimbing.flatMap((assignment) => assignment.bimbingan));
    return { item, activity, roadmap: deriveRoadmap(item.milestones), risk: deriveRisk(item.status, activity, now) };
  });
  return <main className="mx-auto min-h-screen max-w-7xl space-y-6 p-6 sm:p-10"><PageHeader eyebrow="OPERASIONAL AKADEMIK" title="Monitoring Tugas Akhir" description="Pantau status resmi, aktivitas terakhir, risiko, dan personal roadmap." /><section className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-5"><table className="w-full min-w-[1100px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Mahasiswa</th><th className="p-2">Prodi</th><th className="p-2">Status</th><th className="p-2">Progress Roadmap</th><th className="p-2">Item berikutnya</th><th className="p-2">Aktivitas akademik terakhir</th><th className="p-2">Tindak lanjut terbaru</th><th className="p-2">Risiko</th></tr></thead><tbody>{rows.map(({ item, activity, roadmap, risk }) => <tr key={item.id} className="border-b border-slate-100 align-top"><td className="p-2 font-medium">{item.mahasiswa.nama}<br/><span className="font-normal text-slate-500">{item.mahasiswa.nimNip}</span></td><td className="p-2">{item.mahasiswa.prodi?.kode ?? "—"}</td><td className="p-2"><StatusBadge status={item.status} /></td><td className="p-2">{roadmap.percentage === null ? "N/A" : `${roadmap.completed}/${roadmap.total} selesai (${Math.round(roadmap.percentage)}%)`}</td><td className="p-2">{roadmap.next ?? "Belum ada roadmap"}</td><td className="p-2">{activity ? formatJakartaDateTime(activity) : "—"}</td><td className="max-w-xs p-2">{item.tindakLanjut[0] ? <>{item.tindakLanjut[0].catatan}<br/><span className="text-xs text-slate-500">{item.tindakLanjut[0].author.nama}</span></> : "—"}</td><td className="p-2 font-semibold"><StatusBadge status={risk} /></td></tr>)}</tbody></table>{!rows.length ? <p className="py-4 text-slate-600">Belum ada data monitoring.</p> : null}</section></main>;
}
