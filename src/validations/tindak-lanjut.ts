import { z } from "zod";

export const createTindakLanjutSchema = z.object({
  tugasAkhirId: z.string().uuid("Tugas akhir tidak valid."),
  catatan: z
    .string()
    .trim()
    .min(1, "Catatan tindak lanjut wajib diisi.")
    .max(4000, "Catatan terlalu panjang."),
});
