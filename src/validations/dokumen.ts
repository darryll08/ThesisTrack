import { z } from "zod";

export const blobDokumenPayloadSchema = z.object({
  tugasAkhirId: z.string().uuid("Tugas akhir tidak valid."),
});

export const finalizeDokumenUploadSchema = z.object({
  tugasAkhirId: z.string().uuid("Tugas akhir tidak valid."),
  jenis: z
    .string()
    .trim()
    .min(1, "Nama atau jenis dokumen wajib diisi.")
    .max(255, "Nama atau jenis dokumen terlalu panjang."),
  namaFile: z
    .string()
    .trim()
    .min(1, "Nama file tidak valid.")
    .max(255, "Nama file terlalu panjang.")
    .refine((value) => value.toLowerCase().endsWith(".pdf"), {
      message: "File harus berupa PDF.",
    }),
  storagePath: z.string().trim().min(1).max(1000),
});

export type FinalizeDokumenUploadInput = z.infer<
  typeof finalizeDokumenUploadSchema
>;
