"use server";

import {
  PengajuanTopikStatus,
  StatusAktif,
  TugasAkhirStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { jakartaCalendarDate } from "@/lib/jakarta-date";
import { serializableTransaction } from "@/lib/transaction";
import { reviewPengajuanTopikSchema } from "@/validations/tugas-akhir";

class WorkflowError extends Error {}

export async function reviewPengajuanTopikAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentDosen = await requireRole("DOSEN");
  const parsed = reviewPengajuanTopikSchema.safeParse({
    pengajuanId: formData.get("pengajuanId"),
    keputusan: formData.get("keputusan"),
    catatan: formData.get("catatan"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Review belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const tugasAkhirId = await serializableTransaction(async (tx) => {
      const pengajuan = await tx.pengajuanTopik.findUnique({
        where: { id: parsed.data.pengajuanId },
        select: {
          id: true,
          judul: true,
          status: true,
          tugasAkhirId: true,
          tugasAkhir: { select: { status: true } },
        },
      });
      if (!pengajuan) throw new WorkflowError("Pengajuan tidak ditemukan.");
      if (pengajuan.status !== PengajuanTopikStatus.MENUNGGU) {
        throw new WorkflowError("Pengajuan ini sudah diproses.");
      }
      if (pengajuan.tugasAkhir.status !== TugasAkhirStatus.DRAFT) {
        throw new WorkflowError("Tugas akhir tidak lagi berstatus DRAFT.");
      }

      const activeSupervisor = await tx.pembimbing.count({
        where: {
          tugasAkhirId: pengajuan.tugasAkhirId,
          dosenId: currentDosen.id,
          status: StatusAktif.ACTIVE,
        },
      });
      if (activeSupervisor !== 1) {
        throw new WorkflowError(
          "Dosen tersebut bukan pembimbing aktif tugas akhir ini.",
        );
      }

      if (parsed.data.keputusan === PengajuanTopikStatus.PERLU_REVISI) {
        const updated = await tx.pengajuanTopik.updateMany({
          where: {
            id: pengajuan.id,
            status: PengajuanTopikStatus.MENUNGGU,
          },
          data: {
            status: PengajuanTopikStatus.PERLU_REVISI,
            validatorId: currentDosen.id,
            catatan: parsed.data.catatan,
            decidedAt: new Date(),
          },
        });
        if (updated.count !== 1) {
          throw new WorkflowError("Pengajuan ini sudah diproses.");
        }
        return pengajuan.tugasAkhirId;
      }

      const supervisors = await tx.pembimbing.findMany({
        where: {
          tugasAkhirId: pengajuan.tugasAkhirId,
          status: StatusAktif.ACTIVE,
        },
        select: { dosenId: true, urutan: true },
      });
      if (
        supervisors.length !== 2 ||
        new Set(supervisors.map((item) => item.dosenId)).size !== 2 ||
        !supervisors.some((item) => item.urutan === 1) ||
        !supervisors.some((item) => item.urutan === 2)
      ) {
        throw new WorkflowError(
          "Tugas akhir harus memiliki dua pembimbing aktif sebelum disetujui.",
        );
      }

      const approvalAt = new Date();

      const submissionUpdated = await tx.pengajuanTopik.updateMany({
        where: {
          id: pengajuan.id,
          status: PengajuanTopikStatus.MENUNGGU,
        },
        data: {
          status: PengajuanTopikStatus.DISETUJUI,
          validatorId: currentDosen.id,
          catatan: parsed.data.catatan ?? null,
          decidedAt: approvalAt,
        },
      });
      if (submissionUpdated.count !== 1) {
        throw new WorkflowError("Pengajuan ini sudah diproses.");
      }

      const thesisUpdated = await tx.tugasAkhir.updateMany({
        where: {
          id: pengajuan.tugasAkhirId,
          status: TugasAkhirStatus.DRAFT,
        },
        data: {
          status: TugasAkhirStatus.ACTIVE,
          judulFinal: pengajuan.judul,
          tanggalMulai: jakartaCalendarDate(approvalAt),
        },
      });
      if (thesisUpdated.count !== 1) {
        throw new WorkflowError("Tugas akhir tidak lagi berstatus DRAFT.");
      }

      return pengajuan.tugasAkhirId;
    });

    revalidatePath("/dosen/tugas-akhir");
    revalidatePath(`/dosen/tugas-akhir/${tugasAkhirId}`);
    revalidatePath("/mahasiswa/tugas-akhir");
    revalidatePath("/koordinator/tugas-akhir");
    revalidatePath(`/koordinator/tugas-akhir/${tugasAkhirId}`);
    return {
      success: true,
      message:
        parsed.data.keputusan === PengajuanTopikStatus.DISETUJUI
          ? "Pengajuan disetujui dan tugas akhir diaktifkan."
          : "Pengajuan dikembalikan untuk revisi.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof WorkflowError
          ? error.message
          : "Review pengajuan gagal diproses.",
    };
  }
}
