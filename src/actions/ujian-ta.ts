"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { persistSchedule, SchedulingError } from "@/lib/scheduling";
import { serializableTransaction } from "@/lib/transaction";
import { ujianTaSchema } from "@/validations/ujian-ta";

function input(formData: FormData) {
  return {
    tugasAkhirId: formData.get("tugasAkhirId"),
    ruanganId: formData.get("ruanganId"),
    jenis: formData.get("jenis"),
    tanggal: formData.get("tanggal"),
    jamMulai: formData.get("jamMulai"),
    jamSelesai: formData.get("jamSelesai"),
  };
}

async function saveUjianTa(
  id: string | null,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("KOORDINATOR");
  const parsed = ujianTaSchema.safeParse(input(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Jadwal ujian belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const tanggal = new Date(`${parsed.data.tanggal}T00:00:00.000Z`);
  const jamMulai = new Date(`1970-01-01T${parsed.data.jamMulai}:00.000Z`);
  const jamSelesai = new Date(`1970-01-01T${parsed.data.jamSelesai}:00.000Z`);

  try {
    await serializableTransaction(async (tx) => {
      await persistSchedule(tx, id, {
        tugasAkhirId: parsed.data.tugasAkhirId,
        ruanganId: parsed.data.ruanganId,
        jenis: parsed.data.jenis,
        tanggal,
        jamMulai,
        jamSelesai,
      });
    });
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof SchedulingError
          ? error.message
          : "Jadwal ujian gagal disimpan.",
    };
  }

  revalidatePath("/koordinator/jadwal");
  revalidatePath("/mahasiswa/agenda");
  revalidatePath("/dosen/jadwal");
  return {
    success: true,
    message: id ? "Jadwal berhasil diperbarui." : "Jadwal berhasil dibuat.",
  };
}

export async function createUjianTaAction(
  _state: ActionState,
  formData: FormData,
) {
  return saveUjianTa(null, formData);
}

export async function updateUjianTaAction(
  id: string,
  _state: ActionState,
  formData: FormData,
) {
  return saveUjianTa(id, formData);
}
