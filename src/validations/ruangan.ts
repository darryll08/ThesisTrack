import { StatusAktif } from "@prisma/client";
import { z } from "zod";

export const ruanganSchema = z.object({
  kode: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Kode wajib diisi.")
    .max(30, "Kode maksimal 30 karakter."),
  nama: z.string().trim().min(1, "Nama wajib diisi."),
  lokasi: z.string().trim().min(1, "Lokasi wajib diisi."),
  kapasitas: z.coerce
    .number()
    .int("Kapasitas harus berupa bilangan bulat.")
    .positive("Kapasitas harus lebih dari 0."),
  status: z.nativeEnum(StatusAktif),
});
