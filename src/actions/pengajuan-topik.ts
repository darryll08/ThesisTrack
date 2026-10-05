"use server";

import { PengajuanTopikStatus, TugasAkhirStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { serializableTransaction } from "@/lib/transaction";
import { createPengajuanTopikSchema } from "@/validations/tugas-akhir";

export async function createPengajuanTopikAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const parsed = createPengajuanTopikSchema.safeParse({
    tugasAkhirId: formData.get("tugasAkhirId"),
    judul: formData.get("judul"),
    bidang: formData.get("bidang"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Pengajuan belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await serializableTransaction(async (tx) => {
      const tugasAkhir = await tx.tugasAkhir.findUnique({
        where: { id: parsed.data.tugasAkhirId },
        select: { mahasiswaId: true, status: true },
      });

      if (!tugasAkhir || tugasAkhir.mahasiswaId !== mahasiswa.id) {
        return "NOT_FOUND" as const;
      }
      if (tugasAkhir.status === TugasAkhirStatus.ACTIVE) {
        return "ACTIVE" as const;
      }
      if (tugasAkhir.status !== TugasAkhirStatus.DRAFT) {
        return "INVALID_STATUS" as const;
      }

      const pending = await tx.pengajuanTopik.count({
        where: {
          tugasAkhirId: parsed.data.tugasAkhirId,
          status: PengajuanTopikStatus.MENUNGGU,
        },
      });
      if (pending > 0) return "PENDING" as const;

      await tx.pengajuanTopik.create({
        data: {
          tugasAkhirId: parsed.data.tugasAkhirId,
          judul: parsed.data.judul,
          bidang: parsed.data.bidang ?? null,
          status: PengajuanTopikStatus.MENUNGGU,
        },
      });
      return "CREATED" as const;
    });

    if (result === "NOT_FOUND") {
      return { success: false, message: "Tugas akhir tidak ditemukan." };
    }
    if (result === "ACTIVE") {
      return {
        success: false,
        message: "Tugas akhir aktif tidak dapat menerima pengajuan baru.",
      };
    }
    if (result === "INVALID_STATUS") {
      return {
        success: false,
        message: "Status tugas akhir tidak memperbolehkan pengajuan.",
      };
    }
    if (result === "PENDING") {
      return {
        success: false,
        message: "Anda masih memiliki pengajuan yang menunggu review.",
      };
    }

    revalidatePath("/mahasiswa/tugas-akhir");
    revalidatePath("/koordinator/tugas-akhir");
    revalidatePath("/dosen/tugas-akhir");
    return { success: true, message: "Pengajuan topik berhasil dikirim." };
  } catch {
    return { success: false, message: "Pengajuan topik gagal dikirim." };
  }
}
