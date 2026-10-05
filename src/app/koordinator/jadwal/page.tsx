import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusAktif, TugasAkhirStatus } from "@prisma/client";
import Link from "next/link";
import { z } from "zod";
import { UjianTaForm } from "@/components/koordinator/ujian-ta-form";
import { requireRole } from "@/lib/auth";
import {
  dateInputValue,
  formatDatabaseTime,
  formatJakartaDate,
  timeInputValue,
} from "@/lib/date-display";
import { prisma } from "@/lib/prisma";

export default async function KoordinatorJadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  await requireRole("KOORDINATOR");
  const { edit } = await searchParams;
  const editId =
    typeof edit === "string" && z.string().uuid().safeParse(edit).success
      ? edit
      : null;
  const [tugasAkhir, ruangan, schedules, editing] = await Promise.all([
    prisma.tugasAkhir.findMany({
      where: { status: TugasAkhirStatus.ACTIVE },
      select: {
        id: true,
        judulFinal: true,
        mahasiswa: { select: { nama: true, nimNip: true } },
      },
      orderBy: { mahasiswa: { nama: "asc" } },
    }),
    prisma.ruangan.findMany({
      where: { status: StatusAktif.ACTIVE, kapasitas: { gt: 0 } },
      orderBy: { kode: "asc" },
    }),
    prisma.ujianTa.findMany({
      include: {
        tugasAkhir: { include: { mahasiswa: { select: { nama: true } } } },
        ruangan: true,
      },
      orderBy: [{ tanggal: "asc" }, { jamMulai: "asc" }],
    }),
    editId
      ? prisma.ujianTa.findUnique({
          where: { id: editId },
          include: {
            tugasAkhir: {
              include: { mahasiswa: { select: { nama: true, nimNip: true } } },
            },
          },
        })
      : null,
  ]);
  const activeTa = tugasAkhir.map((item) => ({
    id: item.id,
    label: `${item.mahasiswa.nama} (${item.mahasiswa.nimNip ?? "tanpa NIM"}) — ${item.judulFinal ?? "Tanpa judul"}`,
  }));
  const activeRooms = ruangan.map((item) => ({
    id: item.id,
    label: `${item.kode} — ${item.nama} (${item.kapasitas})`,
  }));
  const editable =
    editing?.status === "TERJADWAL" &&
    editing.tugasAkhir.status === TugasAkhirStatus.ACTIVE
      ? editing
      : null;
  const formSchedule = editable
    ? {
        id: editable.id,
        tugasAkhirId: editable.tugasAkhirId,
        tugasAkhirLabel: `${editable.tugasAkhir.mahasiswa.nama} (${editable.tugasAkhir.mahasiswa.nimNip ?? "tanpa NIM"}) — ${editable.tugasAkhir.judulFinal ?? "Tanpa judul"}`,
        ruanganId: editable.ruanganId,
        jenis: editable.jenis,
        tanggal: dateInputValue(editable.tanggal),
        jamMulai: timeInputValue(editable.jamMulai),
        jamSelesai: timeInputValue(editable.jamSelesai),
      }
    : undefined;

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 p-6 sm:p-10">
      <PageHeader eyebrow="OPERASIONAL AKADEMIK" title="Jadwal Seminar Hasil &amp; Sidang" description="Kelola penjadwalan akademik dan penggunaan ruang." />
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editable ? "Edit jadwal" : "Buat jadwal"}
        </h2>
        <UjianTaForm
          key={editable?.updatedAt.toISOString() ?? "create"}
          tugasAkhir={activeTa}
          ruangan={activeRooms}
          schedule={formSchedule}
        />
        {editable ? (
          <Link
            href="/koordinator/jadwal"
            className="mt-3 inline-block text-sm text-blue-700"
          >
            Batal edit
          </Link>
        ) : null}
      </section>
      <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-5">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">Mahasiswa</th>
              <th className="p-2">Jenis</th>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Jam</th>
              <th className="p-2">Ruangan</th>
              <th className="p-2">Status</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((item) => (
              <tr key={item.id} className={`border-b border-slate-100 ${item.status !== "TERJADWAL" ? "historical-row" : ""}`}>
                <td className="p-2">{item.tugasAkhir.mahasiswa.nama}</td>
                <td className="p-2">{item.jenis}</td>
                <td className="p-2">{formatJakartaDate(item.tanggal)}</td>
                <td className="p-2">
                  {formatDatabaseTime(item.jamMulai)}–
                  {formatDatabaseTime(item.jamSelesai)}
                </td>
                <td className="p-2">
                  {item.ruangan.kode} · {item.ruangan.nama}
                </td>
                <td className="p-2"><StatusBadge status={item.status} /></td>
                <td className="p-2">
                  {item.status === "TERJADWAL" &&
                  item.tugasAkhir.status === TugasAkhirStatus.ACTIVE ? (
                    <Link
                      href={`/koordinator/jadwal?edit=${item.id}`}
                      className="text-blue-700"
                    >
                      Edit
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!schedules.length ? (
          <p className="py-4 text-slate-600">Belum ada jadwal.</p>
        ) : null}
      </section>
    </main>
  );
}
