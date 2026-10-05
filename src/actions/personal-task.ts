"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { personalTaskSchema } from "@/validations/personal-task";

function inputFrom(formData: FormData) {
  return {
    nama: formData.get("nama"),
    tipe: formData.get("tipe"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status"),
  };
}

function dueDate(value: string | undefined) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export async function createPersonalTaskAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const parsed = personalTaskSchema.safeParse(inputFrom(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Personal task belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.personalTask.create({
      data: {
        pemilikId: mahasiswa.id,
        nama: parsed.data.nama,
        tipe: parsed.data.tipe,
        dueDate: dueDate(parsed.data.dueDate),
        status: parsed.data.status,
      },
    });
    revalidatePath("/mahasiswa/workspace");
    return { success: true, message: "Task berhasil dibuat." };
  } catch {
    return { success: false, message: "Task gagal dibuat." };
  }
}

export async function updatePersonalTaskAction(
  id: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const parsed = personalTaskSchema.safeParse(inputFrom(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Personal task belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const updated = await prisma.personalTask.updateMany({
      where: { id, pemilikId: mahasiswa.id },
      data: {
        nama: parsed.data.nama,
        tipe: parsed.data.tipe,
        dueDate: dueDate(parsed.data.dueDate),
        status: parsed.data.status,
      },
    });
    if (updated.count !== 1) {
      return { success: false, message: "Task tidak ditemukan." };
    }
    revalidatePath("/mahasiswa/workspace");
    return { success: true, message: "Task berhasil diperbarui." };
  } catch {
    return { success: false, message: "Task gagal diperbarui." };
  }
}

export async function deletePersonalTaskAction(
  id: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _state;
  void _formData;
  const mahasiswa = await requireRole("MAHASISWA");
  try {
    const deleted = await prisma.personalTask.deleteMany({
      where: { id, pemilikId: mahasiswa.id },
    });
    if (deleted.count !== 1) {
      return { success: false, message: "Task tidak ditemukan." };
    }
    revalidatePath("/mahasiswa/workspace");
    return { success: true, message: "Task berhasil dihapus." };
  } catch {
    return { success: false, message: "Task gagal dihapus." };
  }
}
