import type { PenggunaRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { roleHome } from "@/lib/auth-routes";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user.id) return null;

  return prisma.pengguna.findFirst({
    where: { id: session.user.id, status: "ACTIVE" },
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      prodiId: true,
      mustChangePassword: true,
    },
  });
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: PenggunaRole) {
  const user = await requireAuthenticatedUser();
  if (user.mustChangePassword) redirect("/change-password");
  if (user.role !== role) redirect(roleHome[user.role]);
  return user;
}

export function requireAdmin() {
  return requireRole("ADMIN");
}
