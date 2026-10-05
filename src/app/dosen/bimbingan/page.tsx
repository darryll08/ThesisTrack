import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { PdfLink } from "@/components/ui/pdf-link";
import { BimbinganStatus, StatusAktif, TugasAkhirStatus } from "@prisma/client";
import { ReviewBimbinganForm } from "@/components/dosen/review-bimbingan-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DosenBimbinganPage() {
  const dosen = await requireRole("DOSEN");
  const items = await prisma.bimbingan.findMany({
    where: { pembimbing: { dosenId: dosen.id, status: StatusAktif.ACTIVE, tugasAkhir: { status: { in: [TugasAkhirStatus.ACTIVE, TugasAkhirStatus.COMPLETED] } } } },
    include: { pembimbing: { include: { tugasAkhir: { include: { mahasiswa: { select: { nama: true, nimNip: true } } } } } }, taMilestone: true, dokumen: true },
    orderBy: { submittedAt: "desc" },
  });
  const sorted = [...items].sort((a, b) => Number(b.status === BimbinganStatus.MENUNGGU) - Number(a.status === BimbinganStatus.MENUNGGU));

  return <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-6 sm:p-10"><PageHeader eyebrow="DOSEN PEMBIMBING" title="Review Bimbingan" description="Permintaan bimbingan dan riwayat hasil review." />{sorted.length ? <div className="space-y-5">{sorted.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-6"><div className="flex flex-wrap justify-between gap-2"><div><h2 className="text-lg font-semibold">{item.pembimbing.tugasAkhir.mahasiswa.nama}</h2><p className="text-sm text-slate-600">{item.pembimbing.tugasAkhir.mahasiswa.nimNip} · {item.taMilestone?.nama ?? "Tanpa item roadmap"}</p></div><span className="font-medium"><StatusBadge status={item.status} /></span></div><p className="mt-3 text-sm">Tanggal: {item.tanggal.toLocaleDateString("id-ID")}</p><p className="mt-2">{item.topik}</p>{item.dokumen ? <div className="mt-2 flex flex-wrap items-center gap-2 text-sm"><span>Dokumen: {item.dokumen.namaFile} v{item.dokumen.versi}</span><PdfLink documentId={item.dokumen.id} available={Boolean(item.dokumen.storagePath)} /></div> : null}{item.feedback ? <p className="mt-2 text-sm">Feedback: {item.feedback}</p> : null}{item.revisionItem ? <p className="mt-1 text-sm text-red-700">Revision item: {item.revisionItem}</p> : null}{item.status === BimbinganStatus.MENUNGGU && item.pembimbing.tugasAkhir.status === TugasAkhirStatus.ACTIVE ? <ReviewBimbinganForm bimbinganId={item.id} /> : null}</article>)}</div> : <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">Belum ada permintaan bimbingan.</p>}</main>;
}
