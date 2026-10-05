import { PenggunaRole, StatusAktif } from "@prisma/client";
import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).optional(),
);

const penggunaFields = {
  nama: z.string().trim().min(1, "Nama wajib diisi."),
  email: z.string().trim().toLowerCase().email("Format email tidak valid."),
  role: z.nativeEnum(PenggunaRole),
  nimNip: optionalTrimmedString,
  prodiId: optionalTrimmedString,
  status: z.nativeEnum(StatusAktif),
};

function validateRoleFields(
  data: { role: PenggunaRole; nimNip?: string; prodiId?: string },
  context: z.RefinementCtx,
) {
  if (data.role === PenggunaRole.ADMIN) return;

  if (!data.nimNip) {
    context.addIssue({
      code: "custom",
      path: ["nimNip"],
      message: "NIM/NIP wajib untuk pengguna non-Admin.",
    });
  }

  if (!data.prodiId) {
    context.addIssue({
      code: "custom",
      path: ["prodiId"],
      message: "Program Studi wajib untuk pengguna non-Admin.",
    });
  }
}

export const createPenggunaSchema = z
  .object({
    ...penggunaFields,
    password: z
      .string()
      .min(8, "Temporary password minimal 8 karakter.")
      .refine(
        (value) => value.trim().length > 0,
        "Temporary password tidak boleh hanya berisi spasi.",
      ),
  })
  .superRefine(validateRoleFields);

export const updatePenggunaSchema = z
  .object(penggunaFields)
  .superRefine(validateRoleFields);
