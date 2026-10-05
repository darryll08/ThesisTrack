"use server";

import { TugasAkhirStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { jakartaCalendarDate } from "@/lib/jakarta-date";
import { canCompleteTugasAkhir } from "@/lib/phase5";
import { serializableTransaction } from "@/lib/transaction";

class TugasAkhirError extends Error {}

export async function startTugasAkhirAction(
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _state;
  void _formData;
  const mahasiswa = await requireRole("MAHASISWA");

  try {
    const result = await serializableTransaction(async (tx) => {
      const existing = await tx.tugasAkhir.findFirst({
        where: {
          mahasiswaId: mahasiswa.id,
          status: { in: [TugasAkhirStatus.DRAFT, TugasAkhirStatus.ACTIVE] },
        },
        select: { id: true, status: true },
        orderBy: { createdAt: "desc" },
      });

      if (existing) return { created: false, status: existing.status };

      await tx.tugasAkhir.create({
        data: { mahasiswaId: mahasiswa.id, status: TugasAkhirStatus.DRAFT },
      });
      return { created: true, status: TugasAkhirStatus.DRAFT };
    });

    revalidatePath("/mahasiswa/tugas-akhir");
    revalidatePath("/koordinator/tugas-akhir");
    if (result.created) {
      return { success: true, message: "Proses tugas akhir berhasil dimulai." };
    }
    return {
      success: true,
      message:
        result.status === TugasAkhirStatus.ACTIVE
          ? "Anda sudah memiliki tugas akhir aktif."
          : "Draft tugas akhir yang sudah ada digunakan kembali.",
    };
  } catch {
    return { success: false, message: "Proses tugas akhir gagal dimulai." };
  }
}

export async function completeTugasAkhirAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("KOORDINATOR");
  const tugasAkhirId = formData.get("tugasAkhirId");
  if (typeof tugasAkhirId !== "string" || !/^[0-9a-f-]{36}$/i.test(tugasAkhirId)) {
    return { success: false, message: "Tugas akhir tidak valid." };
  }

  try {
    await serializableTransaction(async (tx) => {
      const completedAt = new Date();
      const tugasAkhir = await tx.tugasAkhir.findUnique({ where: { id: tugasAkhirId }, select: { status: true } });
      if (!tugasAkhir || !canCompleteTugasAkhir("KOORDINATOR", tugasAkhir.status)) {
        throw new TugasAkhirError("Hanya tugas akhir ACTIVE yang dapat diselesaikan.");
      }
      const updated = await tx.tugasAkhir.updateMany({
        where: { id: tugasAkhirId, status: TugasAkhirStatus.ACTIVE },
        data: { status: TugasAkhirStatus.COMPLETED, tanggalSelesai: jakartaCalendarDate(completedAt) },
      });
      if (updated.count !== 1) throw new TugasAkhirError("Hanya tugas akhir ACTIVE yang dapat diselesaikan.");
    });
    for (const path of ["/koordinator/tugas-akhir", `/koordinator/tugas-akhir/${tugasAkhirId}`, "/koordinator/monitoring", "/koordinator/analytics", "/mahasiswa", "/mahasiswa/tugas-akhir"]) revalidatePath(path);
    return { success: true, message: "Tugas akhir ditandai selesai." };
  } catch (error) {
    return { success: false, message: error instanceof TugasAkhirError ? error.message : "Tugas akhir gagal diselesaikan." };
  }
}
