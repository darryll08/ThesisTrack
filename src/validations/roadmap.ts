import { z } from "zod";

export const roadmapNameSchema = z.object({
  tugasAkhirId: z.string().uuid("Tugas akhir tidak valid."),
  nama: z.string().trim().min(1, "Nama item wajib diisi.").max(255),
});

export const roadmapItemSchema = z.object({
  itemId: z.string().uuid("Item roadmap tidak valid."),
});

export const moveRoadmapItemSchema = roadmapItemSchema.extend({
  direction: z.enum(["UP", "DOWN"]),
});
