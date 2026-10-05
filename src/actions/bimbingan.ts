"use server";

import {
  BimbinganStatus,
  DokumenStatus,
  PenggunaRole,
  StatusAktif,
  TugasAkhirStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { serializableTransaction } from "@/lib/transaction";
import {
  createBimbinganSchema,
  reviewBimbinganSchema,
} from "@/validations/bimbingan";

class BimbinganError extends Error {}

export async function createBimbinganAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const parsed = createBimbinganSchema.safeParse({
    tugasAkhirId: formData.get("tugasAkhirId"),
    pembimbingId: formData.get("pembimbingId"),
    taMilestoneId: formData.get("taMilestoneId"),
    dokumenId: formData.get("dokumenId"),
    tanggal: formData.get("tanggal"),
    topik: formData.get("topik"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Permintaan bimbingan belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await serializableTransaction(async (tx) => {
      const tugasAkhir = await tx.tugasAkhir.findFirst({
        where: {
          id: parsed.data.tugasAkhirId,
          mahasiswaId: mahasiswa.id,
          status: TugasAkhirStatus.ACTIVE,
        },
        select: { id: true },
      });
      if (!tugasAkhir) {
        throw new BimbinganError("Tugas akhir aktif tidak ditemukan.");
      }

      const pembimbing = await tx.pembimbing.findFirst({
        where: {
          id: parsed.data.pembimbingId,
          tugasAkhirId: tugasAkhir.id,
          status: StatusAktif.ACTIVE,
          dosen: {
            role: PenggunaRole.DOSEN,
            status: StatusAktif.ACTIVE,
          },
        },
        select: { id: true },
      });
      if (!pembimbing) {
        throw new BimbinganError("Dosen tersebut bukan pembimbing aktif Anda.");
      }

      if (parsed.data.taMilestoneId) {
        const roadmapItem = await tx.taMilestone.findFirst({
          where: { id: parsed.data.taMilestoneId, tugasAkhirId: tugasAkhir.id },
          select: { id: true },
        });
        if (!roadmapItem) {
          throw new BimbinganError("Item roadmap tidak berasal dari tugas akhir ini.");
        }
      }

      if (parsed.data.dokumenId) {
        const document = await tx.dokumen.findFirst({
          where: {
            id: parsed.data.dokumenId,
            tugasAkhirId: tugasAkhir.id,
            status: DokumenStatus.MENUNGGU_REVIEW,
            storagePath: { not: null },
          },
          select: { id: true },
        });
        if (!document) {
          throw new BimbinganError(
            "Dokumen harus merupakan upload aktif yang menunggu review.",
          );
        }

        const pendingDocument = await tx.bimbingan.count({
          where: {
            dokumenId: document.id,
            status: BimbinganStatus.MENUNGGU,
          },
        });
        if (pendingDocument > 0) {
          throw new BimbinganError(
            "Dokumen ini sudah digunakan pada bimbingan yang menunggu review.",
          );
        }
      }

      await tx.bimbingan.create({
        data: {
          pembimbingId: pembimbing.id,
          taMilestoneId: parsed.data.taMilestoneId ?? null,
          dokumenId: parsed.data.dokumenId ?? null,
          tanggal: new Date(`${parsed.data.tanggal}T00:00:00.000Z`),
          topik: parsed.data.topik,
          status: BimbinganStatus.MENUNGGU,
          feedback: null,
          revisionItem: null,
          reviewedAt: null,
        },
      });
    });

    revalidatePath("/mahasiswa/bimbingan");
    revalidatePath("/dosen/bimbingan");
    return { success: true, message: "Permintaan bimbingan berhasil dibuat." };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof BimbinganError
          ? error.message
          : "Permintaan bimbingan gagal dibuat.",
    };
  }
}

export async function reviewBimbinganAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentDosen = await requireRole("DOSEN");
  const parsed = reviewBimbinganSchema.safeParse({
    bimbinganId: formData.get("bimbinganId"),
    keputusan: formData.get("keputusan"),
    feedback: formData.get("feedback"),
    revisionItem: formData.get("revisionItem"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Review bimbingan belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const tugasAkhirId = await serializableTransaction(async (tx) => {
      const liveDosen = await tx.pengguna.findFirst({
        where: {
          id: currentDosen.id,
          role: PenggunaRole.DOSEN,
          status: StatusAktif.ACTIVE,
        },
        select: { id: true },
      });
      if (!liveDosen) throw new BimbinganError("Akun Dosen tidak aktif.");

      const bimbingan = await tx.bimbingan.findUnique({
        where: { id: parsed.data.bimbinganId },
        select: {
          id: true,
          status: true,
          dokumenId: true,
          pembimbing: {
            select: {
              dosenId: true,
              tugasAkhirId: true,
              status: true,
              tugasAkhir: { select: { status: true } },
            },
          },
          taMilestone: { select: { id: true, tugasAkhirId: true } },
          dokumen: {
            select: { id: true, tugasAkhirId: true, status: true },
          },
        },
      });
      if (!bimbingan) throw new BimbinganError("Bimbingan tidak ditemukan.");
      if (bimbingan.status !== BimbinganStatus.MENUNGGU) {
        throw new BimbinganError("Bimbingan ini sudah diproses.");
      }
      if (
        bimbingan.pembimbing.dosenId !== currentDosen.id ||
        bimbingan.pembimbing.status !== StatusAktif.ACTIVE
      ) {
        throw new BimbinganError("Bimbingan ini bukan assignment aktif Anda.");
      }
      if (bimbingan.pembimbing.tugasAkhir.status !== TugasAkhirStatus.ACTIVE) {
        throw new BimbinganError("Tugas akhir tidak lagi aktif.");
      }
      if (
        bimbingan.taMilestone &&
        bimbingan.taMilestone.tugasAkhirId !== bimbingan.pembimbing.tugasAkhirId
      ) {
        throw new BimbinganError("Item roadmap tidak sesuai dengan tugas akhir.");
      }
      if (
        bimbingan.dokumen &&
        (bimbingan.dokumen.tugasAkhirId !== bimbingan.pembimbing.tugasAkhirId ||
          bimbingan.dokumen.status !== DokumenStatus.MENUNGGU_REVIEW)
      ) {
        throw new BimbinganError("Dokumen tidak lagi dapat direview.");
      }

      const reviewedAt = new Date();
      const reviewUpdated = await tx.bimbingan.updateMany({
        where: {
          id: bimbingan.id,
          status: BimbinganStatus.MENUNGGU,
        },
        data: {
          status: parsed.data.keputusan,
          feedback: parsed.data.feedback ?? null,
          revisionItem:
            parsed.data.keputusan === BimbinganStatus.PERLU_REVISI
              ? parsed.data.revisionItem
              : null,
          reviewedAt,
        },
      });
      if (reviewUpdated.count !== 1) {
        throw new BimbinganError("Bimbingan ini sudah diproses.");
      }

      if (parsed.data.keputusan === BimbinganStatus.PERLU_REVISI) {
        if (bimbingan.dokumenId) {
          const documentUpdated = await tx.dokumen.updateMany({
            where: {
              id: bimbingan.dokumenId,
              tugasAkhirId: bimbingan.pembimbing.tugasAkhirId,
              status: DokumenStatus.MENUNGGU_REVIEW,
            },
            data: { status: DokumenStatus.PERLU_REVISI },
          });
          if (documentUpdated.count !== 1) {
            throw new BimbinganError("Dokumen tidak lagi dapat direview.");
          }
        }
        return bimbingan.pembimbing.tugasAkhirId;
      }

      if (bimbingan.dokumenId) {
        const documentUpdated = await tx.dokumen.updateMany({
          where: {
            id: bimbingan.dokumenId,
            tugasAkhirId: bimbingan.pembimbing.tugasAkhirId,
            status: DokumenStatus.MENUNGGU_REVIEW,
          },
          data: { status: DokumenStatus.TERVERIFIKASI },
        });
        if (documentUpdated.count !== 1) {
          throw new BimbinganError("Dokumen tidak lagi dapat direview.");
        }
      }

      return bimbingan.pembimbing.tugasAkhirId;
    });

    revalidatePath("/dosen/bimbingan");
    revalidatePath("/mahasiswa/bimbingan");
    revalidatePath("/mahasiswa/dokumen");
    revalidatePath("/mahasiswa/tugas-akhir");
    revalidatePath(`/dosen/tugas-akhir/${tugasAkhirId}`);
    return { success: true, message: "Review bimbingan berhasil disimpan." };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof BimbinganError
          ? error.message
          : "Review bimbingan gagal diproses.",
    };
  }
}
