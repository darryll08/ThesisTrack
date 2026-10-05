"use server";

import { StatusAktif } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueTarget } from "@/lib/prisma-errors";
import { ruanganSchema } from "@/validations/ruangan";

function ruanganInput(formData: FormData) {
  return {
    kode: formData.get("kode"),
    nama: formData.get("nama"),
    lokasi: formData.get("lokasi"),
    kapasitas: formData.get("kapasitas"),
    status: formData.get("status"),
  };
}

function validationState(error: ReturnType<typeof ruanganSchema.safeParse>) {
  if (error.success) return null;
  return {
    success: false,
    message: "Data Ruangan belum valid.",
    errors: error.error.flatten().fieldErrors,
  } satisfies ActionState;
}

export async function createRuanganAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = ruanganSchema.safeParse(ruanganInput(formData));
  if (!parsed.success) return validationState(parsed)!;

  try {
    await prisma.ruangan.create({ data: parsed.data });
  } catch (error) {
    if (uniqueTarget(error).length) {
      return { success: false, message: "Kode Ruangan sudah digunakan." };
    }
    return { success: false, message: "Ruangan gagal dibuat." };
  }

  revalidatePath("/admin/ruangan");
  return { success: true, message: "Ruangan berhasil dibuat." };
}

export async function updateRuanganAction(
  id: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = ruanganSchema.safeParse(ruanganInput(formData));
  if (!parsed.success) return validationState(parsed)!;

  try {
    await prisma.ruangan.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (uniqueTarget(error).length) {
      return { success: false, message: "Kode Ruangan sudah digunakan." };
    }
    return { success: false, message: "Ruangan gagal diperbarui." };
  }

  revalidatePath("/admin/ruangan");
  redirect("/admin/ruangan?message=Ruangan%20berhasil%20diperbarui");
}

export async function toggleRuanganStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const room = await prisma.ruangan.findUnique({ where: { id }, select: { status: true } });
  if (!room) redirect("/admin/ruangan?error=Ruangan%20tidak%20ditemukan");

  await prisma.ruangan.update({
    where: { id },
    data: {
      status:
        room.status === StatusAktif.ACTIVE
          ? StatusAktif.INACTIVE
          : StatusAktif.ACTIVE,
    },
  });
  revalidatePath("/admin/ruangan");
  redirect("/admin/ruangan?message=Status%20Ruangan%20berhasil%20diubah");
}

export async function deleteRuanganAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const references = await prisma.ujianTa.count({ where: { ruanganId: id } });

  if (references > 0) {
    redirect("/admin/ruangan?error=Ruangan%20masih%20digunakan%20jadwal.%20Nonaktifkan%20sebagai%20alternatif");
  }

  try {
    await prisma.ruangan.delete({ where: { id } });
  } catch {
    redirect("/admin/ruangan?error=Ruangan%20tidak%20dapat%20dihapus");
  }

  revalidatePath("/admin/ruangan");
  redirect("/admin/ruangan?message=Ruangan%20berhasil%20dihapus");
}
