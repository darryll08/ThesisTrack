import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { PdfLink } from "@/components/ui/pdf-link";
import { TugasAkhirStatus } from "@prisma/client";
import { DokumenUploadForm } from "@/components/mahasiswa/dokumen-upload-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MahasiswaDokumenPage() {
  const mahasiswa = await requireRole("MAHASISWA");
  const activeTa = await prisma.tugasAkhir.findFirst({
    where: { mahasiswaId: mahasiswa.id, status: TugasAkhirStatus.ACTIVE },
    select: { id: true, judulFinal: true, status: true },
  });
  const tugasAkhir =
    activeTa ??
    (await prisma.tugasAkhir.findFirst({
      where: { mahasiswaId: mahasiswa.id, status: TugasAkhirStatus.COMPLETED },
      select: { id: true, judulFinal: true, status: true },
      orderBy: { createdAt: "desc" },
    }));
  const documents = tugasAkhir
    ? await prisma.dokumen.findMany({
        where: { tugasAkhirId: tugasAkhir.id },
        orderBy: [{ jenis: "asc" }, { versi: "desc" }],
      })
    : [];

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-6 sm:p-10">
      <PageHeader eyebrow="AKADEMIK" title="Dokumen" description="Dokumen tugas akhir dan riwayat versinya." />
      {tugasAkhir?.status === TugasAkhirStatus.ACTIVE ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Upload versi baru</h2>
          <DokumenUploadForm tugasAkhirId={tugasAkhir.id} />
        </section>
      ) : (
        <p className="rounded bg-amber-50 p-4 text-amber-900">
          Upload hanya tersedia saat tugas akhir berstatus ACTIVE.
        </p>
      )}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Riwayat dokumen</h2>
        {documents.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Nama</th>
                  <th className="p-2">Jenis</th>
                  <th className="p-2">Versi</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Diupload</th>
                  <th className="p-2">File</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="p-2 font-medium">{item.namaFile}</td>
                    <td className="p-2">{item.jenis}</td>
                    <td className="p-2">v{item.versi}</td>
                    <td className="p-2"><StatusBadge status={item.status} /></td>
                    <td className="p-2">
                      {item.uploadedAt.toLocaleString("id-ID")}
                    </td>
                    <td className="p-2"><PdfLink documentId={item.id} available={Boolean(item.storagePath)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-600">
            Belum ada dokumen yang dapat ditampilkan.
          </p>
        )}
      </section>
    </main>
  );
}
