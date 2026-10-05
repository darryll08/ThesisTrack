"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import type { ActionState } from "@/lib/action-state";
import { roleHome } from "@/lib/auth-routes";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema, loginSchema } from "@/validations/auth";

export async function loginAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data login.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Email atau password tidak valid.",
      };
    }

    throw error;
  }

  return { success: true, message: "Login berhasil." };
}

export async function changePasswordAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAuthenticatedUser();
  if (!user.mustChangePassword) redirect(roleHome[user.role]);

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Password belum dapat disimpan.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.pengguna.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  await signOut({ redirectTo: "/login?passwordChanged=1" });
  return { success: true, message: "Password berhasil diubah." };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
