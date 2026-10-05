import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatJakartaDate } from "@/lib/date-display";
import { RoadmapManager } from "@/components/mahasiswa/roadmap-manager";
import {
  PengajuanTopikStatus,
  StatusAktif,
  TugasAkhirStatus,
} from "@prisma/client";
import { PengajuanTopikForm } from "@/components/mahasiswa/pengajuan-topik-form";
import { StartTugasAkhirForm } from "@/components/mahasiswa/start-tugas-akhir-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MahasiswaTugasAkhirPage() {
  const mahasiswa = await requireRole("MAHASISWA");
  const findTugasAkhir = (statuses: TugasAkhirStatus[]) =>
    prisma.tugasAkhir.findFirst({
      where: {
        mahasiswaId: mahasiswa.id,
        status: { in: statuses },
      },
      include: {
        pengajuanTopik: {
          include: { validator: { select: { nama: true } } },
          orderBy: { submittedAt: "desc" },
        },
        pembimbing: {
          where: { status: StatusAktif.ACTIVE },
          include: { dosen: { select: { nama: true, nimNip: true } } },
          orderBy: { urutan: "asc" },
        },
        milestones: {
          orderBy: { urutan: "asc" },
        },
        tindakLanjut: {
          include: { author: { select: { nama: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  const tugasAkhir =
    (await findTugasAkhir([TugasAkhirStatus.DRAFT, TugasAkhirStatus.ACTIVE])) ??
    (await findTugasAkhir([TugasAkhirStatus.COMPLETED]));

  const pending = tugasAkhir?.pengajuanTopik.some(
    (item) => item.status === PengajuanTopikStatus.MENUNGGU,
  );

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-6 sm:p-10">
      <PageHeader eyebrow="AKADEMIK" title="Tugas Akhir" description="Status, pembimbing, personal roadmap, dan riwayat pengajuan topik." />

      {!tugasAkhir ? (
        <section className="editorial-section">
          <h2 className="text-lg font-semibold">
            Belum ada proses tugas akhir
          </h2>
          <p className="mb-4 mt-1 text-slate-600">
            Mulai proses untuk membuat satu tugas akhir berstatus DRAFT.
          </p>
          <StartTugasAkhirForm />
        </section>
      ) : (
        <>
          <section className="thesis-context">
            <StatusBadge status={tugasAkhir.status} />
            <h2 className="dashboard-title">{tugasAkhir.judulFinal ?? "Judul final belum ditetapkan"}</h2>
            <p className="text-xs text-slate-500">Mulai: {tugasAkhir.tanggalMulai ? formatJakartaDate(tugasAkhir.tanggalMulai) : "Menunggu persetujuan"} · Selesai: {tugasAkhir.tanggalSelesai ? formatJakartaDate(tugasAkhir.tanggalSelesai) : "—"}</p>
          </section>
          <RoadmapManager
            tugasAkhirId={tugasAkhir.id}
            items={tugasAkhir.milestones}
            editable={tugasAkhir.status === TugasAkhirStatus.DRAFT || tugasAkhir.status === TugasAkhirStatus.ACTIVE}
          />

          <section className="editorial-section">
            <h2 className="mb-3 text-lg font-semibold">Pembimbing</h2>
            {tugasAkhir.pembimbing.length ? (
              <ol className="space-y-2">
                {tugasAkhir.pembimbing.map((item) => (
                  <li key={item.id}>
                    Pembimbing {item.urutan}: {item.dosen.nama}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-slate-600">Belum ditetapkan.</p>
            )}
          </section>

          {tugasAkhir.status === TugasAkhirStatus.DRAFT && !pending ? (
            <section className="editorial-section">
              <h2 className="mb-4 text-lg font-semibold">Ajukan topik</h2>
              <PengajuanTopikForm tugasAkhirId={tugasAkhir.id} />
            </section>
          ) : null}

          {pending ? (
            <p className="rounded bg-amber-50 p-4 text-amber-900">
              Pengajuan terbaru sedang menunggu review pembimbing.
            </p>
          ) : null}

          <section className="editorial-section">
            <h2 className="mb-4 text-lg font-semibold">Histori pengajuan</h2>
            {tugasAkhir.pengajuanTopik.length ? (
              <div className="space-y-4">
                {tugasAkhir.pengajuanTopik.map((item, index) => (
                  <article
                    key={item.id}
                    className="rounded border border-slate-200 p-4"
                  >
                    <p className="text-sm text-slate-500">
                      Pengajuan #{tugasAkhir.pengajuanTopik.length - index}
                    </p>
                    <h3 className="font-semibold">{item.judul}</h3>
                    <p className="text-sm">Bidang: {item.bidang ?? "—"}</p>
                    <p className="mt-2 text-sm font-medium"><StatusBadge status={item.status} /></p>
                    {item.catatan ? (
                      <p className="mt-2 text-sm text-slate-700">
                        Catatan: {item.catatan}
                      </p>
                    ) : null}
                    {item.validator ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Validator: {item.validator.nama}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-slate-600">Belum ada pengajuan.</p>
            )}
          </section>


          <section className="editorial-section">
            <h2 className="mb-4 text-lg font-semibold">
              Tindak lanjut pembimbing
            </h2>
            {tugasAkhir.tindakLanjut.length ? (
              <div className="space-y-3">
                {tugasAkhir.tindakLanjut.map((item) => (
                  <article
                    key={item.id}
                    className="rounded border border-slate-200 p-4"
                  >
                    <p>{item.catatan}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {item.author.nama} ·{" "}
                      {item.createdAt.toLocaleString("id-ID")}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-slate-600">Belum ada tindak lanjut.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
