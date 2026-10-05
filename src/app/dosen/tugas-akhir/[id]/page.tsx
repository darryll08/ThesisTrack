import { StatusBadge } from "@/components/ui/status-badge";
import { ThesisProgressTrack } from "@/components/shared/thesis-progress-track";
import { PengajuanTopikStatus, StatusAktif, TugasAkhirStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewPengajuanForm } from "@/components/dosen/review-pengajuan-form";
import { TindakLanjutForm } from "@/components/dosen/tindak-lanjut-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DosenTugasAkhirDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const dosen = await requireRole("DOSEN");
  const { id } = await params;
  const tugasAkhir = await prisma.tugasAkhir.findFirst({
    where: {
      id,
      pembimbing: {
        some: { dosenId: dosen.id, status: StatusAktif.ACTIVE },
      },
    },
    include: {
      mahasiswa: { include: { prodi: true } },
      milestones: { orderBy: { urutan: "asc" } },
      pengajuanTopik: {
        include: { validator: { select: { nama: true } } },
        orderBy: { submittedAt: "desc" },
      },
      pembimbing: {
        where: { status: StatusAktif.ACTIVE },
        include: { dosen: { select: { nama: true } } },
        orderBy: { urutan: "asc" },
      },
      tindakLanjut: {
        include: { author: { select: { nama: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!tugasAkhir) notFound();

  const pending = tugasAkhir.pengajuanTopik.find(
    (item) => item.status === PengajuanTopikStatus.MENUNGGU,
  );

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-6 sm:p-10">
      <div><Link href="/dosen/tugas-akhir" className="text-sm text-blue-700">← Daftar bimbingan</Link><h1 className="mt-2 text-2xl font-bold">{tugasAkhir.mahasiswa.nama}</h1><p className="text-slate-600">{tugasAkhir.mahasiswa.nimNip} · {tugasAkhir.mahasiswa.prodi?.nama ?? "Tanpa Prodi"}</p></div>
      <section className="editorial-section"><p>Status TA: <StatusBadge status={tugasAkhir.status} /></p><p className="dashboard-title">{tugasAkhir.judulFinal ?? "Judul final belum ditetapkan"}</p><h2 className="mb-2 mt-5 font-semibold">Pembimbing aktif</h2><ol>{tugasAkhir.pembimbing.map((item) => <li key={item.id}>Pembimbing {item.urutan}: {item.dosen.nama}</li>)}</ol></section>
      <ThesisProgressTrack milestones={tugasAkhir.milestones} />
      {pending && tugasAkhir.status === TugasAkhirStatus.DRAFT ? (
        <section className="editorial-section"><h2 className="text-lg font-semibold">Review pengajuan terbaru</h2><p className="mb-4 mt-2">{pending.judul}</p><ReviewPengajuanForm pengajuanId={pending.id} /></section>
      ) : null}
      {tugasAkhir.status === TugasAkhirStatus.ACTIVE ? (
        <section className="editorial-section"><h2 className="mb-4 text-lg font-semibold">Tambah tindak lanjut</h2><TindakLanjutForm tugasAkhirId={tugasAkhir.id} /></section>
      ) : null}
      <section className="editorial-section"><h2 className="mb-4 text-lg font-semibold">Histori tindak lanjut</h2>{tugasAkhir.tindakLanjut.length ? <div className="space-y-3">{tugasAkhir.tindakLanjut.map((item) => <article key={item.id} className="rounded border border-slate-200 p-4"><p>{item.catatan}</p><p className="mt-2 text-xs text-slate-500">{item.author.nama} · {item.createdAt.toLocaleString("id-ID")}</p></article>)}</div> : <p className="text-slate-600">Belum ada tindak lanjut.</p>}</section>
      <section className="editorial-section"><h2 className="mb-4 text-lg font-semibold">Histori pengajuan</h2><div className="space-y-3">{tugasAkhir.pengajuanTopik.map((item) => <article key={item.id} className="rounded border border-slate-200 p-4"><h3 className="font-semibold">{item.judul}</h3><p className="text-sm">{item.bidang ?? "Tanpa bidang"} · <StatusBadge status={item.status} /></p>{item.catatan ? <p className="mt-2 text-sm">Catatan: {item.catatan}</p> : null}{item.validator ? <p className="mt-1 text-xs text-slate-500">Validator: {item.validator.nama}</p> : null}</article>)}</div></section>
    </main>
  );
}
