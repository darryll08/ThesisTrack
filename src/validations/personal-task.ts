import { PersonalTaskStatus, PersonalTaskTipe } from "@prisma/client";
import { z } from "zod";

const optionalDate = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal jatuh tempo tidak valid.")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
    }, "Tanggal jatuh tempo tidak valid.")
    .optional(),
);

export const personalTaskSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(1, "Nama task wajib diisi.")
    .max(255, "Nama task terlalu panjang."),
  tipe: z.nativeEnum(PersonalTaskTipe),
  dueDate: optionalDate,
  status: z.nativeEnum(PersonalTaskStatus),
});
