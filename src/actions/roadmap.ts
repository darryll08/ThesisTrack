"use server";

import { TaMilestoneStatus, TugasAkhirStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { canEditRoadmap } from "@/lib/phase5";
import { serializableTransaction } from "@/lib/transaction";
import {
  moveRoadmapItemSchema,
  roadmapItemSchema,
  roadmapNameSchema,
} from "@/validations/roadmap";

class RoadmapError extends Error {}

const editableStatuses = [TugasAkhirStatus.DRAFT, TugasAkhirStatus.ACTIVE];

function revalidateRoadmap() {
  for (const path of [
    "/mahasiswa",
    "/mahasiswa/tugas-akhir",
    "/mahasiswa/bimbingan",
    "/dosen",
    "/dosen/tugas-akhir",
    "/koordinator/monitoring",
    "/koordinator/analytics",
  ]) revalidatePath(path);
}

async function editableItem(
  tx: Parameters<Parameters<typeof serializableTransaction>[0]>[0],
  itemId: string,
  mahasiswaId: string,
) {
  const item = await tx.taMilestone.findFirst({
    where: { id: itemId },
    include: { tugasAkhir: { select: { mahasiswaId: true, status: true } } },
  });
  if (!item || !canEditRoadmap("MAHASISWA", mahasiswaId, item.tugasAkhir.mahasiswaId, item.tugasAkhir.status)) {
    throw new RoadmapError("Item roadmap tidak ditemukan atau sudah read-only.");
  }
  return item;
}

export async function createRoadmapItemAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const parsed = roadmapNameSchema.safeParse({
    tugasAkhirId: formData.get("tugasAkhirId"),
    nama: formData.get("nama"),
  });
  if (!parsed.success) return { success: false, message: "Item belum valid.", errors: parsed.error.flatten().fieldErrors };

  try {
    await serializableTransaction(async (tx) => {
      const tugasAkhir = await tx.tugasAkhir.findFirst({
        where: { id: parsed.data.tugasAkhirId, mahasiswaId: mahasiswa.id, status: { in: editableStatuses } },
        select: { id: true },
      });
      if (!tugasAkhir) throw new RoadmapError("Roadmap tugas akhir ini sudah read-only.");
      const last = await tx.taMilestone.aggregate({
        where: { tugasAkhirId: tugasAkhir.id },
        _max: { urutan: true },
      });
      await tx.taMilestone.create({
        data: { tugasAkhirId: tugasAkhir.id, nama: parsed.data.nama, urutan: (last._max.urutan ?? 0) + 1 },
      });
    });
    revalidateRoadmap();
    return { success: true, message: "Item roadmap ditambahkan." };
  } catch (error) {
    return { success: false, message: error instanceof RoadmapError ? error.message : "Item roadmap gagal ditambahkan." };
  }
}

export async function renameRoadmapItemAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const item = roadmapItemSchema.safeParse({ itemId: formData.get("itemId") });
  const name = typeof formData.get("nama") === "string" ? String(formData.get("nama")).trim() : "";
  if (!item.success || !name || name.length > 255) return { success: false, message: "Nama item belum valid." };
  try {
    await serializableTransaction(async (tx) => {
      const current = await editableItem(tx, item.data.itemId, mahasiswa.id);
      await tx.taMilestone.update({ where: { id: current.id }, data: { nama: name } });
    });
    revalidateRoadmap();
    return { success: true, message: "Item roadmap diperbarui." };
  } catch (error) {
    return { success: false, message: error instanceof RoadmapError ? error.message : "Item roadmap gagal diperbarui." };
  }
}

export async function toggleRoadmapItemAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const parsed = roadmapItemSchema.safeParse({ itemId: formData.get("itemId") });
  if (!parsed.success) return { success: false, message: "Item roadmap tidak valid." };
  try {
    await serializableTransaction(async (tx) => {
      const item = await editableItem(tx, parsed.data.itemId, mahasiswa.id);
      const checked = item.status === TaMilestoneStatus.SELESAI;
      await tx.taMilestone.update({
        where: { id: item.id },
        data: { status: checked ? TaMilestoneStatus.BELUM : TaMilestoneStatus.SELESAI, completedAt: checked ? null : new Date() },
      });
    });
    revalidateRoadmap();
    return { success: true, message: "Checklist roadmap diperbarui." };
  } catch (error) {
    return { success: false, message: error instanceof RoadmapError ? error.message : "Checklist roadmap gagal diperbarui." };
  }
}

export async function moveRoadmapItemAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const parsed = moveRoadmapItemSchema.safeParse({ itemId: formData.get("itemId"), direction: formData.get("direction") });
  if (!parsed.success) return { success: false, message: "Perubahan urutan tidak valid." };
  try {
    await serializableTransaction(async (tx) => {
      const item = await editableItem(tx, parsed.data.itemId, mahasiswa.id);
      const neighbor = await tx.taMilestone.findFirst({
        where: {
          tugasAkhirId: item.tugasAkhirId,
          urutan: parsed.data.direction === "UP" ? { lt: item.urutan } : { gt: item.urutan },
        },
        orderBy: { urutan: parsed.data.direction === "UP" ? "desc" : "asc" },
      });
      if (!neighbor) return;
      await tx.taMilestone.update({ where: { id: item.id }, data: { urutan: -1 } });
      await tx.taMilestone.update({ where: { id: neighbor.id }, data: { urutan: item.urutan } });
      await tx.taMilestone.update({ where: { id: item.id }, data: { urutan: neighbor.urutan } });
    });
    revalidateRoadmap();
    return { success: true, message: "Urutan roadmap diperbarui." };
  } catch (error) {
    return { success: false, message: error instanceof RoadmapError ? error.message : "Urutan roadmap gagal diperbarui." };
  }
}

export async function deleteRoadmapItemAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const mahasiswa = await requireRole("MAHASISWA");
  const parsed = roadmapItemSchema.safeParse({ itemId: formData.get("itemId") });
  if (!parsed.success) return { success: false, message: "Item roadmap tidak valid." };
  try {
    await serializableTransaction(async (tx) => {
      const item = await editableItem(tx, parsed.data.itemId, mahasiswa.id);
      await tx.taMilestone.delete({ where: { id: item.id } });
      const later = await tx.taMilestone.findMany({ where: { tugasAkhirId: item.tugasAkhirId, urutan: { gt: item.urutan } }, orderBy: { urutan: "asc" } });
      for (const row of later) await tx.taMilestone.update({ where: { id: row.id }, data: { urutan: row.urutan - 1 } });
    });
    revalidateRoadmap();
    return { success: true, message: "Item roadmap dihapus." };
  } catch (error) {
    return { success: false, message: error instanceof RoadmapError ? error.message : "Item roadmap gagal dihapus." };
  }
}
