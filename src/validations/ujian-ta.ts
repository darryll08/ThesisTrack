import { UjianTaJenis } from "@prisma/client";
import { z } from "zod";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "Tanggal tidak valid.");

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Jam tidak valid.");

export const ujianTaSchema = z
  .object({
    tugasAkhirId: z.string().uuid("Tugas akhir tidak valid."),
    ruanganId: z.string().uuid("Ruangan tidak valid."),
    jenis: z.enum([UjianTaJenis.SEMINAR_HASIL, UjianTaJenis.SIDANG]),
    tanggal: dateString,
    jamMulai: timeString,
    jamSelesai: timeString,
  })
  .refine((data) => data.jamSelesai > data.jamMulai, {
    path: ["jamSelesai"],
    message: "Jam selesai harus setelah jam mulai.",
  });
