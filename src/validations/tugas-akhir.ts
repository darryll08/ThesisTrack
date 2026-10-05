import { PengajuanTopikStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(max).optional(),
  );

export const createPengajuanTopikSchema = z.object({
  tugasAkhirId: z.string().uuid("Tugas akhir tidak valid."),
  judul: z
    .string()
    .trim()
    .min(1, "Judul usulan wajib diisi.")
    .max(1000, "Judul usulan terlalu panjang."),
  bidang: optionalText(255),
});

export const assignPembimbingSchema = z
  .object({
    tugasAkhirId: z.string().uuid("Tugas akhir tidak valid."),
    pembimbingSatuId: z.string().uuid("Pembimbing 1 tidak valid."),
    pembimbingDuaId: z.string().uuid("Pembimbing 2 tidak valid."),
  })
  .refine((data) => data.pembimbingSatuId !== data.pembimbingDuaId, {
    path: ["pembimbingDuaId"],
    message: "Pembimbing 1 dan Pembimbing 2 harus berbeda.",
  });

export const reviewPengajuanTopikSchema = z
  .object({
    pengajuanId: z.string().uuid("Pengajuan tidak valid."),
    keputusan: z.enum([
      PengajuanTopikStatus.DISETUJUI,
      PengajuanTopikStatus.PERLU_REVISI,
    ]),
    catatan: optionalText(4000),
  })
  .superRefine((data, context) => {
    if (
      data.keputusan === PengajuanTopikStatus.PERLU_REVISI &&
      !data.catatan
    ) {
      context.addIssue({
        code: "custom",
        path: ["catatan"],
        message: "Catatan revisi wajib diisi.",
      });
    }
  });
