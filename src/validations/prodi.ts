import { StatusAktif } from "@prisma/client";
import { z } from "zod";

export const prodiSchema = z.object({
  kode: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Kode wajib diisi.")
    .max(20, "Kode maksimal 20 karakter."),
  nama: z.string().trim().min(1, "Nama wajib diisi."),
  status: z.nativeEnum(StatusAktif),
});
