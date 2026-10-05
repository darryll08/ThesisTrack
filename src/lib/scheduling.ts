import {
  type Prisma,
  StatusAktif,
  TugasAkhirStatus,
  type UjianTaJenis,
  UjianTaStatus,
} from "@prisma/client";

export class SchedulingError extends Error {}

export type ScheduleInput = {
  tugasAkhirId: string;
  ruanganId: string;
  jenis: UjianTaJenis;
  tanggal: Date;
  jamMulai: Date;
  jamSelesai: Date;
};

export async function persistSchedule(
  tx: Prisma.TransactionClient,
  id: string | null,
  input: ScheduleInput,
) {
  let existingTugasAkhirId: string | null = null;
  if (id) {
    const existing = await tx.ujianTa.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        tugasAkhirId: true,
        tugasAkhir: { select: { status: true } },
      },
    });
    if (!existing) throw new SchedulingError("Jadwal ujian tidak ditemukan.");
    if (existing.status !== UjianTaStatus.TERJADWAL) {
      throw new SchedulingError("Jadwal historis tidak dapat diubah.");
    }
    if (existing.tugasAkhir.status !== TugasAkhirStatus.ACTIVE) {
      throw new SchedulingError("Tugas akhir pada jadwal tidak lagi aktif.");
    }
    if (input.tugasAkhirId !== existing.tugasAkhirId) {
      throw new SchedulingError(
        "Jadwal tidak dapat dipindahkan ke tugas akhir lain.",
      );
    }
    existingTugasAkhirId = existing.tugasAkhirId;
  }
  if (input.jenis !== "SEMINAR_HASIL" && input.jenis !== "SIDANG") {
    throw new SchedulingError("Jenis ujian tidak valid.");
  }
  if (!(input.jamSelesai > input.jamMulai)) {
    throw new SchedulingError("Jam selesai harus setelah jam mulai.");
  }

  const [tugasAkhir, ruangan] = await Promise.all([
    tx.tugasAkhir.findFirst({
      where: { id: input.tugasAkhirId, status: TugasAkhirStatus.ACTIVE },
      select: { id: true },
    }),
    tx.ruangan.findFirst({
      where: {
        id: input.ruanganId,
        status: StatusAktif.ACTIVE,
        kapasitas: { gt: 0 },
      },
      select: { id: true },
    }),
  ]);
  if (!tugasAkhir)
    throw new SchedulingError("Tugas akhir harus berstatus ACTIVE.");
  if (!ruangan)
    throw new SchedulingError(
      "Ruangan aktif tidak ditemukan atau kapasitasnya tidak valid.",
    );

  const excludeSelf = id ? { id: { not: id } } : {};
  const duplicate = await tx.ujianTa.findFirst({
    where: {
      tugasAkhirId: existingTugasAkhirId ?? tugasAkhir.id,
      jenis: input.jenis,
      status: { not: UjianTaStatus.DIBATALKAN },
      ...excludeSelf,
    },
    select: { id: true },
  });
  if (duplicate)
    throw new SchedulingError("Jenis ujian ini sudah mempunyai jadwal aktif.");

  const conflict = await tx.ujianTa.findFirst({
    where: {
      ruanganId: ruangan.id,
      tanggal: input.tanggal,
      status: { not: UjianTaStatus.DIBATALKAN },
      jamMulai: { lt: input.jamSelesai },
      jamSelesai: { gt: input.jamMulai },
      ...excludeSelf,
    },
    select: { id: true },
  });
  if (conflict)
    throw new SchedulingError(
      "Ruangan sudah digunakan pada waktu yang bertabrakan.",
    );

  const data = { ...input, status: UjianTaStatus.TERJADWAL };
  return id
    ? tx.ujianTa.update({ where: { id }, data })
    : tx.ujianTa.create({ data });
}
