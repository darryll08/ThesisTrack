import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid."),
  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .refine((value) => value.trim().length > 0, "Password wajib diisi."),
});

export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .refine(
        (value) => value.trim().length > 0,
        "Password tidak boleh hanya berisi spasi.",
      ),
    confirmation: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmation, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmation"],
  });
