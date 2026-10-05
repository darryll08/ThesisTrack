import { StatusBadge } from "@/components/ui/status-badge";
import { PengajuanTopikStatus, PenggunaRole, StatusAktif, TugasAkhirStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignPembimbingForm } from "@/components/koordinator/assign-pembimbing-form";
import { CompleteTugasAkhirForm } from "@/components/koordinator/complete-tugas-akhir-form";
import { ThesisProgressTrack } from "@/components/shared/thesis-progress-track";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function KoordinatorTugasAkhirDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("KOORDINATOR");
  const { id } = await params;
  const [tugasAkhir, dosen] = await Promise.all([
    prisma.tugasAkhir.findUnique({
      where: { id },
      include: {
        mahasiswa: { include: { prodi: true } },
        pengajuanTopik: {
          include: { validator: { select: { nama: true } } },
          orderBy: { submittedAt: "desc" },
        },
        pembimbing: {
          where: { status: StatusAktif.ACTIVE },
          include: { dosen: { select: { nama: true, nimNip: true } } },
          orderBy: { urutan: "asc" },
        },
        milestones: { orderBy: { urutan: "asc" } },
      },
    }),
    prisma.pengguna.findMany({
      where: { role: PenggunaRole.DOSEN, status: StatusAktif.ACTIVE },
      select: { id: true, nama: true, nimNip: true },
      orderBy: { nama: "asc" },
    }),
  ]);
  if (!tugasAkhir) notFound();
  const hasPendingSubmission = tugasAkhir.pengajuanTopik.some(
    (item) => item.status === PengajuanTopikStatus.MENUNGGU,
  );

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-6 sm:p-10">
      <div><Link href="/koordinator/tugas-akhir" className="text-sm text-blue-700">← Daftar tugas akhir</Link><h1 className="mt-2 text-2xl font-bold">{tugasAkhir.mahasiswa.nama}</h1><p className="text-slate-600">{tugasAkhir.mahasiswa.nimNip} · {tugasAkhir.mahasiswa.prodi?.nama ?? "Tanpa Prodi"}</p></div>
      <section className="editorial-section"><p>Status: <StatusBadge status={tugasAkhir.status} /></p><p className="dashboard-title">{tugasAkhir.judulFinal ?? "Judul final belum ditetapkan"}</p></section>
      <section className="editorial-section"><h2 className="mb-3 text-lg font-semibold">Pembimbing aktif</h2>{tugasAkhir.pembimbing.length ? <ol className="space-y-2">{tugasAkhir.pembimbing.map((item) => <li key={item.id}>Pembimbing {item.urutan}: {item.dosen.nama}</li>)}</ol> : <p className="text-slate-600">Belum ditetapkan.</p>}</section>
      <ThesisProgressTrack milestones={tugasAkhir.milestones} />
      {tugasAkhir.status === TugasAkhirStatus.DRAFT && hasPendingSubmission ? (
        <section className="editorial-section"><h2 className="mb-4 text-lg font-semibold">Tetapkan dua pembimbing</h2><AssignPembimbingForm tugasAkhirId={tugasAkhir.id} dosen={dosen} defaults={{ satu: tugasAkhir.pembimbing.find((item) => item.urutan === 1)?.dosenId, dua: tugasAkhir.pembimbing.find((item) => item.urutan === 2)?.dosenId }} /></section>
      ) : null}
      {tugasAkhir.status === TugasAkhirStatus.ACTIVE ? <section className="editorial-section"><h2 className="mb-2 text-lg font-semibold">Penyelesaian resmi</h2><p className="mb-4 text-sm text-slate-600">Status resmi tidak mengikuti persentase personal roadmap.</p><CompleteTugasAkhirForm tugasAkhirId={tugasAkhir.id} /></section> : null}
      <section className="editorial-section"><h2 className="mb-4 text-lg font-semibold">Histori pengajuan</h2><div className="space-y-3">{tugasAkhir.pengajuanTopik.map((item) => <article key={item.id} className="rounded border border-slate-200 p-4"><h3 className="font-semibold">{item.judul}</h3><p className="text-sm">{item.bidang ?? "Tanpa bidang"} · <StatusBadge status={item.status} /></p>{item.catatan ? <p className="mt-2 text-sm">Catatan: {item.catatan}</p> : null}{item.validator ? <p className="mt-1 text-xs text-slate-500">Validator: {item.validator.nama}</p> : null}</article>)}</div></section>
    </main>
  );
}
