"use server";

import {
  PenggunaRole,
  StatusAktif,
  TugasAkhirStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { serializableTransaction } from "@/lib/transaction";
import { createTindakLanjutSchema } from "@/validations/tindak-lanjut";

class TindakLanjutError extends Error {}

export async function createTindakLanjutAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dosen = await requireRole("DOSEN");
  const parsed = createTindakLanjutSchema.safeParse({
    tugasAkhirId: formData.get("tugasAkhirId"),
    catatan: formData.get("catatan"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Tindak lanjut belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await serializableTransaction(async (tx) => {
      const liveDosen = await tx.pengguna.findFirst({
        where: {
          id: dosen.id,
          role: PenggunaRole.DOSEN,
          status: StatusAktif.ACTIVE,
        },
        select: { id: true },
      });
      if (!liveDosen) throw new TindakLanjutError("Akun Dosen tidak aktif.");

      const tugasAkhir = await tx.tugasAkhir.findFirst({
        where: {
          id: parsed.data.tugasAkhirId,
          status: TugasAkhirStatus.ACTIVE,
          pembimbing: {
            some: { dosenId: dosen.id, status: StatusAktif.ACTIVE },
          },
        },
        select: { id: true },
      });
      if (!tugasAkhir) {
        throw new TindakLanjutError(
          "Tugas akhir aktif bukan bagian dari bimbingan Anda.",
        );
      }

      await tx.tindakLanjut.create({
        data: {
          tugasAkhirId: tugasAkhir.id,
          authorId: dosen.id,
          catatan: parsed.data.catatan,
        },
      });
    });

    revalidatePath(`/dosen/tugas-akhir/${parsed.data.tugasAkhirId}`);
    revalidatePath("/mahasiswa/tugas-akhir");
    return { success: true, message: "Tindak lanjut berhasil ditambahkan." };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof TindakLanjutError
          ? error.message
          : "Tindak lanjut gagal ditambahkan.",
    };
  }
}
