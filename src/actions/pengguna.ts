"use server";

import {
  PenggunaRole,
  Prisma,
  StatusAktif,
  TugasAkhirStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueTarget } from "@/lib/prisma-errors";
import { serializableTransaction } from "@/lib/transaction";
import {
  createPenggunaSchema,
  updatePenggunaSchema,
} from "@/validations/pengguna";

function penggunaInput(formData: FormData) {
  return {
    nama: formData.get("nama"),
    email: formData.get("email"),
    role: formData.get("role"),
    nimNip: formData.get("nimNip"),
    prodiId: formData.get("prodiId"),
    status: formData.get("status"),
  };
}

function uniqueMessage(error: unknown): string | null {
  const target = uniqueTarget(error).join("_");
  if (target.includes("email")) return "Email sudah digunakan.";
  if (target.includes("nim_nip") || target.includes("nimNip")) {
    return "NIM/NIP sudah digunakan.";
  }
  return target ? "Data pengguna harus unik." : null;
}

async function validProdi(prodiId: string | undefined) {
  if (!prodiId) return false;
  return Boolean(
    await prisma.prodi.findUnique({
      where: { id: prodiId },
      select: { id: true },
    }),
  );
}

const activeSupervisorMessage =
  "Dosen masih menjadi pembimbing aktif pada tugas akhir yang berjalan. Selesaikan atau ganti assignment pembimbing terlebih dahulu.";

class PenggunaError extends Error {}

async function hasRunningSupervision(
  dosenId: string,
  client: Pick<Prisma.TransactionClient, "pembimbing"> = prisma,
) {
  return (
    (await client.pembimbing.count({
      where: {
        dosenId,
        status: StatusAktif.ACTIVE,
        tugasAkhir: {
          status: {
            in: [TugasAkhirStatus.DRAFT, TugasAkhirStatus.ACTIVE],
          },
        },
      },
    })) > 0
  );
}

export async function createPenggunaAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = createPenggunaSchema.safeParse({
    ...penggunaInput(formData),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Data pengguna belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (
    parsed.data.role === PenggunaRole.ADMIN &&
    parsed.data.status !== StatusAktif.ACTIVE
  ) {
    return { success: false, message: "Akun Admin harus berstatus ACTIVE." };
  }

  if (
    parsed.data.role !== PenggunaRole.ADMIN &&
    !(await validProdi(parsed.data.prodiId))
  ) {
    return { success: false, message: "Program Studi tidak valid." };
  }

  try {
    await prisma.pengguna.create({
      data: {
        nama: parsed.data.nama,
        email: parsed.data.email,
        passwordHash: await hash(parsed.data.password, 12),
        role: parsed.data.role,
        nimNip:
          parsed.data.role === PenggunaRole.ADMIN ? null : parsed.data.nimNip,
        prodiId:
          parsed.data.role === PenggunaRole.ADMIN ? null : parsed.data.prodiId,
        status: parsed.data.status,
        mustChangePassword: true,
      },
    });
  } catch (error) {
    const message = uniqueMessage(error);
    if (message) return { success: false, message };
    return { success: false, message: "Pengguna gagal dibuat." };
  }

  revalidatePath("/admin/pengguna");
  return { success: true, message: "Pengguna berhasil dibuat." };
}

export async function updatePenggunaAction(
  id: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = updatePenggunaSchema.safeParse(penggunaInput(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Data pengguna belum valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (
    parsed.data.role === PenggunaRole.ADMIN &&
    parsed.data.status !== StatusAktif.ACTIVE
  ) {
    return { success: false, message: "Akun Admin harus berstatus ACTIVE." };
  }

  if (
    parsed.data.role !== PenggunaRole.ADMIN &&
    !(await validProdi(parsed.data.prodiId))
  ) {
    return { success: false, message: "Program Studi tidak valid." };
  }

  try {
    await serializableTransaction(async (tx) => {
      const current = await tx.pengguna.findUnique({
        where: { id },
        select: { role: true },
      });
      if (!current) throw new PenggunaError("Pengguna tidak ditemukan.");
      if (
        current.role === PenggunaRole.ADMIN &&
        (parsed.data.role !== PenggunaRole.ADMIN ||
          parsed.data.status !== StatusAktif.ACTIVE)
      ) {
        throw new PenggunaError(
          "Akun Admin tidak boleh didemote atau dinonaktifkan.",
        );
      }
      if (
        current.role === PenggunaRole.DOSEN &&
        (parsed.data.role !== PenggunaRole.DOSEN ||
          parsed.data.status === StatusAktif.INACTIVE) &&
        (await hasRunningSupervision(id, tx))
      ) {
        throw new PenggunaError(activeSupervisorMessage);
      }

      await tx.pengguna.update({
        where: { id },
        data: {
          nama: parsed.data.nama,
          email: parsed.data.email,
          role: parsed.data.role,
          nimNip:
            parsed.data.role === PenggunaRole.ADMIN
              ? null
              : parsed.data.nimNip,
          prodiId:
            parsed.data.role === PenggunaRole.ADMIN
              ? null
              : parsed.data.prodiId,
          status: parsed.data.status,
        },
      });
    });
  } catch (error) {
    if (error instanceof PenggunaError) {
      return { success: false, message: error.message };
    }
    const message = uniqueMessage(error);
    if (message) return { success: false, message };
    return { success: false, message: "Pengguna gagal diperbarui." };
  }

  revalidatePath("/admin/pengguna");
  redirect("/admin/pengguna?message=Pengguna%20berhasil%20diperbarui");
}

export async function togglePenggunaStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  try {
    await serializableTransaction(async (tx) => {
      const user = await tx.pengguna.findUnique({
        where: { id },
        select: { role: true, status: true },
      });
      if (!user) throw new PenggunaError("Pengguna tidak ditemukan");
      if (user.role === PenggunaRole.ADMIN) {
        throw new PenggunaError("Akun Admin tidak boleh dinonaktifkan");
      }
      if (
        user.role === PenggunaRole.DOSEN &&
        user.status === StatusAktif.ACTIVE &&
        (await hasRunningSupervision(id, tx))
      ) {
        throw new PenggunaError(activeSupervisorMessage);
      }

      await tx.pengguna.update({
        where: { id },
        data: {
          status:
            user.status === StatusAktif.ACTIVE
              ? StatusAktif.INACTIVE
              : StatusAktif.ACTIVE,
        },
      });
    });
  } catch (error) {
    const message =
      error instanceof PenggunaError
        ? error.message
        : "Status pengguna gagal diubah";
    redirect(`/admin/pengguna?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/pengguna");
  redirect("/admin/pengguna?message=Status%20pengguna%20berhasil%20diubah");
}
