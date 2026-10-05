import type { PenggunaRole, TaMilestoneStatus, TugasAkhirStatus } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

export type DerivedMilestone = {
  status: TaMilestoneStatus;
  nama: string;
  urutan: number;
};

export function canEditRoadmap(
  role: PenggunaRole,
  actorId: string,
  ownerId: string,
  status: TugasAkhirStatus,
) {
  return role === "MAHASISWA" && actorId === ownerId && (status === "DRAFT" || status === "ACTIVE");
}

export function canCompleteTugasAkhir(role: PenggunaRole, status: TugasAkhirStatus) {
  return role === "KOORDINATOR" && status === "ACTIVE";
}

export function hasTimeOverlap(
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date,
) {
  return newStart < existingEnd && newEnd > existingStart;
}

export function deriveRoadmap(milestones: DerivedMilestone[]) {
  const ordered = [...milestones].sort((a, b) => a.urutan - b.urutan);
  const completed = ordered.filter((item) => item.status === "SELESAI").length;
  return {
    total: ordered.length,
    completed,
    percentage: ordered.length ? (completed / ordered.length) * 100 : null,
    next: ordered.find((item) => item.status === "BELUM")?.nama ?? null,
  };
}

export function latestAcademicActivity(
  tanggalMulai: Date | null,
  uploadedAt: Date[],
  bimbingan: { submittedAt: Date; reviewedAt: Date | null }[],
) {
  const candidates = [
    ...(tanggalMulai ? [tanggalMulai] : []),
    ...uploadedAt,
    ...bimbingan.flatMap((item) =>
      item.reviewedAt ? [item.submittedAt, item.reviewedAt] : [item.submittedAt],
    ),
  ];
  return candidates.length
    ? new Date(Math.max(...candidates.map((date) => date.getTime())))
    : null;
}

export function deriveRisk(
  status: TugasAkhirStatus,
  lastActivity: Date | null,
  now: Date,
) {
  if (status === "COMPLETED") return "SELESAI" as const;
  if (status === "DRAFT") return "BELUM_AKTIF" as const;
  if (status !== "ACTIVE") return "DIKECUALIKAN" as const;
  const days = lastActivity
    ? Math.max(0, (now.getTime() - lastActivity.getTime()) / DAY_MS)
    : Number.POSITIVE_INFINITY;
  if (days < 14) return "RENDAH" as const;
  if (days < 30) return "SEDANG" as const;
  return "TINGGI" as const;
}

export function calculateAnalytics(
  items: { status: TugasAkhirStatus; milestones: DerivedMilestone[] }[],
) {
  const population = items.filter(
    (item) => item.status === "ACTIVE" || item.status === "COMPLETED",
  );
  const count = population.length;
  const withRoadmap = population
    .map((item) => deriveRoadmap(item.milestones))
    .filter((roadmap) => roadmap.percentage !== null);
  const averageRoadmapCompletion = withRoadmap.length
    ? withRoadmap.reduce((sum, item) => sum + item.percentage!, 0) /
      withRoadmap.length
    : null;
  const completedPercentage = count
    ? (population.filter((item) => item.status === "COMPLETED").length / count) * 100
    : 0;
  return {
    population: count,
    averageRoadmapCompletion,
    completedPercentage,
    withRoadmap: withRoadmap.length,
    withoutRoadmap: count - withRoadmap.length,
  };
}
