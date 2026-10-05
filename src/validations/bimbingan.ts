import { BimbinganStatus } from "@prisma/client";
import { z } from "zod";

const optionalUuid = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().uuid("Dokumen tidak valid.").optional(),
);

const optionalMilestoneUuid = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().uuid("Item roadmap tidak valid.").optional(),
);

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(4000).optional(),
);

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "Tanggal tidak valid.");

export const createBimbinganSchema = z.object({
  tugasAkhirId: z.string().uuid("Tugas akhir tidak valid."),
  pembimbingId: z.string().uuid("Pembimbing tidak valid."),
  taMilestoneId: optionalMilestoneUuid,
  dokumenId: optionalUuid,
  tanggal: dateString,
  topik: z
    .string()
    .trim()
    .min(1, "Topik wajib diisi.")
    .max(4000, "Topik terlalu panjang."),
});

export const reviewBimbinganSchema = z
  .object({
    bimbinganId: z.string().uuid("Bimbingan tidak valid."),
    keputusan: z.enum([
      BimbinganStatus.TERVALIDASI,
      BimbinganStatus.PERLU_REVISI,
    ]),
    feedback: optionalText,
    revisionItem: optionalText,
  })
  .superRefine((data, context) => {
    if (
      data.keputusan === BimbinganStatus.PERLU_REVISI &&
      !data.revisionItem
    ) {
      context.addIssue({
        code: "custom",
        path: ["revisionItem"],
        message: "Revision item wajib diisi untuk keputusan perlu revisi.",
      });
    }
  });
