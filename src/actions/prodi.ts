"use server";

import { Prisma, StatusAktif } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueTarget } from "@/lib/prisma-errors";
import { prodiSchema } from "@/validations/prodi";

function prodiInput(formData: FormData) {
  return {
    kode: formData.get("kode"),
    nama: formData.get("nama"),
    status: formData.get("status"),
  };
}

function validationState(error: ReturnType<typeof prodiSchema.safeParse>) {
  if (error.success) return null;
  return {
    success: false,
    message: "Data Program Studi belum valid.",
    errors: error.error.flatten().fieldErrors,
  } satisfies ActionState;
}

export async function createProdiAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = prodiSchema.safeParse(prodiInput(formData));
  if (!parsed.success) return validationState(parsed)!;

  try {
    await prisma.prodi.create({ data: parsed.data });
  } catch (error) {
    if (uniqueTarget(error).length) {
      return { success: false, message: "Kode Program Studi sudah digunakan." };
    }
    return { success: false, message: "Program Studi gagal dibuat." };
  }

  revalidatePath("/admin/prodi");
  return { success: true, message: "Program Studi berhasil dibuat." };
}

export async function updateProdiAction(
  id: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = prodiSchema.safeParse(prodiInput(formData));
  if (!parsed.success) return validationState(parsed)!;

  try {
    await prisma.prodi.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (uniqueTarget(error).length) {
      return { success: false, message: "Kode Program Studi sudah digunakan." };
    }
    return { success: false, message: "Program Studi gagal diperbarui." };
  }

  revalidatePath("/admin/prodi");
  redirect("/admin/prodi?message=Program%20Studi%20berhasil%20diperbarui");
}

export async function toggleProdiStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const prodi = await prisma.prodi.findUnique({ where: { id }, select: { status: true } });
  if (!prodi) redirect("/admin/prodi?error=Program%20Studi%20tidak%20ditemukan");

  await prisma.prodi.update({
    where: { id },
    data: {
      status:
        prodi.status === StatusAktif.ACTIVE
          ? StatusAktif.INACTIVE
          : StatusAktif.ACTIVE,
    },
  });
  revalidatePath("/admin/prodi");
  redirect("/admin/prodi?message=Status%20Program%20Studi%20berhasil%20diubah");
}

export async function deleteProdiAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  let deleted: boolean;

  try {
    deleted = await prisma.$transaction(
      async (tx) => {
        const references = await tx.pengguna.count({ where: { prodiId: id } });
        if (references > 0) return false;

        await tx.prodi.delete({ where: { id } });
        return true;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch {
    redirect("/admin/prodi?error=Program%20Studi%20tidak%20dapat%20dihapus");
  }

  if (!deleted) {
    redirect("/admin/prodi?error=Program%20Studi%20masih%20digunakan.%20Nonaktifkan%20sebagai%20alternatif");
  }

  revalidatePath("/admin/prodi");
  redirect("/admin/prodi?message=Program%20Studi%20berhasil%20dihapus");
}
