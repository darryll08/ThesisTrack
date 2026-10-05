import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusAktif } from "@prisma/client";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { deriveRoadmap } from "@/lib/phase5";
import { prisma } from "@/lib/prisma";

export default async function DosenTugasAkhirPage() {
  const dosen = await requireRole("DOSEN");
  const tugasAkhir = await prisma.tugasAkhir.findMany({
    where: {
      pembimbing: {
        some: { dosenId: dosen.id, status: StatusAktif.ACTIVE },
      },
    },
    include: {
      milestones: true,
      mahasiswa: { include: { prodi: { select: { kode: true } } } },
      pengajuanTopik: { orderBy: { submittedAt: "desc" }, take: 1 },
      pembimbing: {
        where: { dosenId: dosen.id, status: StatusAktif.ACTIVE },
        select: { urutan: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-6 sm:p-10">
      <PageHeader eyebrow="RUANG PEMBIMBING" title="Tugas Akhir Bimbingan" description="Pantau judul, personal roadmap, dan status mahasiswa bimbingan." />
      <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-5">
        <table className="w-full min-w-[750px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Mahasiswa</th><th className="p-2">Prodi</th><th className="p-2">Status TA</th><th className="p-2">Judul / Pengajuan</th><th className="p-2">Progress Roadmap</th><th className="p-2">Status</th><th className="p-2">Posisi</th><th className="p-2">Aksi</th></tr></thead><tbody>{tugasAkhir.map((item) => { const latest = item.pengajuanTopik[0]; const roadmap = deriveRoadmap(item.milestones); return <tr key={item.id} className="border-b border-slate-100"><td className="p-2 font-medium">{item.mahasiswa.nama}</td><td className="p-2">{item.mahasiswa.prodi?.kode ?? "—"}</td><td className="p-2"><StatusBadge status={item.status} /></td><td className="max-w-xs p-2">{item.judulFinal ?? latest?.judul ?? "—"}</td><td className="p-2"><strong>{roadmap.percentage === null ? "N/A" : `${Math.round(roadmap.percentage)}%`}</strong><br />{roadmap.total ? `${roadmap.completed} dari ${roadmap.total} selesai` : "Belum ada roadmap"}</td><td className="p-2">{latest ? <StatusBadge status={latest.status} /> : "—"}</td><td className="p-2">Pembimbing {item.pembimbing[0]?.urutan}</td><td className="p-2"><Link href={`/dosen/tugas-akhir/${item.id}`} className="text-blue-700">Detail</Link></td></tr>; })}</tbody></table>
      </section>
    </main>
  );
}
