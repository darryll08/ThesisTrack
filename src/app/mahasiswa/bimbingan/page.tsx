import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { PdfLink } from "@/components/ui/pdf-link";
import { ThesisProgressTrack } from "@/components/shared/thesis-progress-track";
import {
  DokumenStatus,
  StatusAktif,
  TugasAkhirStatus,
} from "@prisma/client";
import { BimbinganForm } from "@/components/mahasiswa/bimbingan-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MahasiswaBimbinganPage() {
  const mahasiswa = await requireRole("MAHASISWA");
  const findTugasAkhir = (status: TugasAkhirStatus) =>
    prisma.tugasAkhir.findFirst({
      where: { mahasiswaId: mahasiswa.id, status },
      include: {
        pembimbing: {
          where: { status: StatusAktif.ACTIVE },
          include: {
            dosen: { select: { nama: true, role: true, status: true } },
          },
          orderBy: { urutan: "asc" },
        },
        milestones: {
          orderBy: { urutan: "asc" },
        },
        dokumen: {
          where: {
            status: DokumenStatus.MENUNGGU_REVIEW,
            storagePath: { not: null },
          },
          orderBy: [{ jenis: "asc" }, { versi: "desc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });
  const activeTa = await findTugasAkhir(TugasAkhirStatus.ACTIVE);
  const tugasAkhir =
    activeTa ?? (await findTugasAkhir(TugasAkhirStatus.COMPLETED));
  const history = tugasAkhir
    ? await prisma.bimbingan.findMany({
        where: {
          pembimbing: { tugasAkhirId: tugasAkhir.id },
        },
        include: {
          pembimbing: { include: { dosen: { select: { nama: true } } } },
          taMilestone: true,
          dokumen: true,
        },
        orderBy: { submittedAt: "desc" },
      })
    : [];

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-6 sm:p-10">
      <PageHeader eyebrow="AKADEMIK" title="Bimbingan" description="Pengajuan dan riwayat bimbingan tugas akhir." />
      {!tugasAkhir ? (
        <p className="rounded bg-amber-50 p-4 text-amber-900">
          Bimbingan tersedia setelah tugas akhir berstatus ACTIVE.
        </p>
      ) : (
        <>
          <ThesisProgressTrack milestones={tugasAkhir.milestones} />
          {tugasAkhir.status === TugasAkhirStatus.ACTIVE ? (
            <section className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Ajukan bimbingan</h2>
              <BimbinganForm
                tugasAkhirId={tugasAkhir.id}
                pembimbing={tugasAkhir.pembimbing
                  .filter(
                    (item) =>
                      item.dosen.role === "DOSEN" &&
                      item.dosen.status === "ACTIVE",
                  )
                  .map((item) => ({
                    id: item.id,
                    label: `Pembimbing ${item.urutan} — ${item.dosen.nama}`,
                  }))}
                milestones={tugasAkhir.milestones.map((item) => ({
                    id: item.id,
                    label: `${item.urutan}. ${item.nama}`,
                  }))}
                documents={tugasAkhir.dokumen.map((item) => ({
                  id: item.id,
                  label: `${item.jenis} v${item.versi} — ${item.namaFile}`,
                }))}
              />
            </section>
          ) : null}
        </>
      )}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Histori bimbingan</h2>
        {history.length ? (
          <div className="space-y-4">
            {history.map((item) => (
              <article
                key={item.id}
                className="rounded border border-slate-200 p-4"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-semibold">
                      {item.taMilestone?.nama ?? "Tanpa item roadmap"}
                  </h3>
                  <span className="text-sm font-medium"><StatusBadge status={item.status} /></span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {item.tanggal.toLocaleDateString("id-ID")} ·{" "}
                  {item.pembimbing.dosen.nama}
                </p>
                <p className="mt-3">{item.topik}</p>
                {item.dokumen ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span>Dokumen: {item.dokumen.namaFile} v{item.dokumen.versi}</span>
                    <PdfLink documentId={item.dokumen.id} available={Boolean(item.dokumen.storagePath)} />
                  </div>
                ) : null}
                {item.feedback ? (
                  <p className="mt-2 text-sm">Feedback: {item.feedback}</p>
                ) : null}
                {item.revisionItem ? (
                  <p className="mt-1 text-sm text-red-700">
                    Revision item: {item.revisionItem}
                  </p>
                ) : null}
                {item.reviewedAt ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Direview {item.reviewedAt.toLocaleString("id-ID")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">Belum ada histori bimbingan.</p>
        )}
      </section>
    </main>
  );
}
