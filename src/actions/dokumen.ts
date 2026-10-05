"use server";

import { del, head } from "@vercel/blob";
import { DokumenStatus, TugasAkhirStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { isDocumentPathForTugasAkhir, MAX_PDF_SIZE_BYTES } from "@/lib/dokumen";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializableTransaction } from "@/lib/transaction";
import {
  finalizeDokumenUploadSchema,
  type FinalizeDokumenUploadInput,
} from "@/validations/dokumen";

type DokumenActionState = ActionState & { documentId?: string };

class DokumenError extends Error {}

export async function finalizeDokumenUploadAction(
  input: FinalizeDokumenUploadInput,
): Promise<DokumenActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const parsed = finalizeDokumenUploadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Data dokumen belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  let verifiedPath: string | null = null;
  let finalized = false;

  try {
    const tugasAkhir = await prisma.tugasAkhir.findFirst({
      where: {
        id: parsed.data.tugasAkhirId,
        mahasiswaId: mahasiswa.id,
        status: TugasAkhirStatus.ACTIVE,
      },
      select: { id: true },
    });
    if (!tugasAkhir) {
      throw new DokumenError("Tugas akhir aktif tidak ditemukan.");
    }
    if (!isDocumentPathForTugasAkhir(parsed.data.storagePath, tugasAkhir.id)) {
      throw new DokumenError("Path dokumen tidak valid.");
    }

    const metadata = await head(parsed.data.storagePath);
    if (metadata.pathname !== parsed.data.storagePath) {
      throw new DokumenError("Path dokumen tidak sesuai.");
    }
    if (metadata.contentType !== "application/pdf") {
      throw new DokumenError("File harus berupa PDF.");
    }
    if (metadata.size <= 0) {
      throw new DokumenError("File PDF kosong.");
    }
    if (metadata.size > MAX_PDF_SIZE_BYTES) {
      throw new DokumenError("Ukuran file maksimal 20 MB.");
    }
    verifiedPath = metadata.pathname;

    const result = await serializableTransaction(async (tx) => {
      const currentTa = await tx.tugasAkhir.findFirst({
        where: {
          id: parsed.data.tugasAkhirId,
          mahasiswaId: mahasiswa.id,
          status: TugasAkhirStatus.ACTIVE,
        },
        select: { id: true },
      });
      if (!currentTa) {
        throw new DokumenError("Tugas akhir tidak lagi aktif.");
      }

      const existing = await tx.dokumen.findFirst({
        where: { storagePath: metadata.pathname },
        select: { id: true, tugasAkhirId: true },
      });
      if (existing) {
        if (existing.tugasAkhirId !== currentTa.id) {
          throw new DokumenError(
            "Path dokumen sudah terhubung ke tugas akhir lain.",
          );
        }
        return { id: existing.id, existing: true };
      }

      const latestVersion = await tx.dokumen.aggregate({
        where: {
          tugasAkhirId: currentTa.id,
          jenis: parsed.data.jenis,
        },
        _max: { versi: true },
      });
      const document = await tx.dokumen.create({
        data: {
          tugasAkhirId: currentTa.id,
          namaFile: parsed.data.namaFile,
          jenis: parsed.data.jenis,
          versi: (latestVersion._max.versi ?? 0) + 1,
          status: DokumenStatus.MENUNGGU_REVIEW,
          storagePath: metadata.pathname,
        },
        select: { id: true },
      });
      return { id: document.id, existing: false };
    });

    finalized = true;
    revalidatePath("/mahasiswa/dokumen");
    revalidatePath("/mahasiswa/bimbingan");
    return {
      success: true,
      message: result.existing
        ? "Dokumen ini sudah difinalisasi sebelumnya."
        : "Dokumen berhasil disimpan.",
      documentId: result.id,
    };
  } catch (error) {
    if (verifiedPath && !finalized) {
      try {
        const referenced = await prisma.dokumen.count({
          where: { storagePath: verifiedPath },
        });
        if (
          referenced === 0 &&
          isDocumentPathForTugasAkhir(verifiedPath, parsed.data.tugasAkhirId)
        ) {
          await del(verifiedPath);
        }
      } catch {
        // Cleanup is best-effort; never hide the original finalize failure.
      }
    }

    return {
      success: false,
      message:
        error instanceof DokumenError
          ? error.message
          : "Penyimpanan dokumen belum dikonfigurasi atau tidak dapat diakses.",
    };
  }
}
