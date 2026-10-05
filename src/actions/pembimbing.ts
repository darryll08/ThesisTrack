"use server";

import {
  PengajuanTopikStatus,
  PenggunaRole,
  StatusAktif,
  TugasAkhirStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { serializableTransaction } from "@/lib/transaction";
import { assignPembimbingSchema } from "@/validations/tugas-akhir";

export async function assignPembimbingAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("KOORDINATOR");
  const parsed = assignPembimbingSchema.safeParse({
    tugasAkhirId: formData.get("tugasAkhirId"),
    pembimbingSatuId: formData.get("pembimbingSatuId"),
    pembimbingDuaId: formData.get("pembimbingDuaId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Data pembimbing belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await serializableTransaction(async (tx) => {
      const tugasAkhir = await tx.tugasAkhir.findUnique({
        where: { id: parsed.data.tugasAkhirId },
        select: { status: true },
      });
      if (!tugasAkhir) return "NOT_FOUND" as const;
      if (tugasAkhir.status !== TugasAkhirStatus.DRAFT) {
        return "INVALID_STATUS" as const;
      }

      const pendingSubmission = await tx.pengajuanTopik.count({
        where: {
          tugasAkhirId: parsed.data.tugasAkhirId,
          status: PengajuanTopikStatus.MENUNGGU,
        },
      });
      if (pendingSubmission === 0) return "NO_PENDING_SUBMISSION" as const;

      const dosen = await tx.pengguna.findMany({
        where: {
          id: {
            in: [
              parsed.data.pembimbingSatuId,
              parsed.data.pembimbingDuaId,
            ],
          },
          role: PenggunaRole.DOSEN,
          status: StatusAktif.ACTIVE,
        },
        select: { id: true },
      });
      if (dosen.length !== 2) return "INVALID_DOSEN" as const;

      const active = await tx.pembimbing.findMany({
        where: {
          tugasAkhirId: parsed.data.tugasAkhirId,
          status: StatusAktif.ACTIVE,
        },
        select: { dosenId: true, urutan: true },
      });
      const desired = new Map([
        [1, parsed.data.pembimbingSatuId],
        [2, parsed.data.pembimbingDuaId],
      ]);

      if (
        active.length > 2 ||
        new Set(active.map((item) => item.dosenId)).size !== active.length ||
        active.some((item) => ![1, 2].includes(item.urutan))
      ) {
        return "INVALID_EXISTING" as const;
      }

      if (active.length === 2) {
        return active.every(
          (item) => desired.get(item.urutan) === item.dosenId,
        )
          ? ("EXISTING" as const)
          : ("COMPLETE" as const);
      }

      if (
        active.some((item) => desired.get(item.urutan) !== item.dosenId)
      ) {
        return "PARTIAL_MISMATCH" as const;
      }

      const assignedIds = new Set(active.map((item) => item.dosenId));
      const missing = [
        { dosenId: parsed.data.pembimbingSatuId, urutan: 1 },
        { dosenId: parsed.data.pembimbingDuaId, urutan: 2 },
      ].filter((item) => !assignedIds.has(item.dosenId));

      await tx.pembimbing.createMany({
        data: missing.map((item) => ({
          tugasAkhirId: parsed.data.tugasAkhirId,
          dosenId: item.dosenId,
          urutan: item.urutan,
          status: StatusAktif.ACTIVE,
        })),
      });
      return "ASSIGNED" as const;
    });

    const messages: Partial<Record<typeof result, string>> = {
      NOT_FOUND: "Tugas akhir tidak ditemukan.",
      INVALID_STATUS: "Status tugas akhir tidak memperbolehkan assignment.",
      NO_PENDING_SUBMISSION:
        "Tugas akhir harus memiliki pengajuan yang menunggu review.",
      INVALID_DOSEN: "Pembimbing harus merupakan Dosen ACTIVE.",
      INVALID_EXISTING: "Data pembimbing aktif saat ini tidak valid.",
      COMPLETE: "Tugas akhir sudah memiliki dua pembimbing aktif.",
      PARTIAL_MISMATCH:
        "Assignment aktif yang ada tidak sesuai. Histori tidak diubah.",
    };
    if (messages[result]) return { success: false, message: messages[result]! };

    revalidatePath("/koordinator/tugas-akhir");
    revalidatePath(`/koordinator/tugas-akhir/${parsed.data.tugasAkhirId}`);
    revalidatePath("/dosen/tugas-akhir");
    revalidatePath("/mahasiswa/tugas-akhir");
    return {
      success: true,
      message:
        result === "EXISTING"
          ? "Assignment pembimbing sudah lengkap; tidak ada duplikasi."
          : "Dua pembimbing berhasil ditetapkan.",
    };
  } catch {
    return { success: false, message: "Pembimbing gagal ditetapkan." };
  }
}
