import assert from "node:assert/strict";
import { calculateAnalytics, canCompleteTugasAkhir, canEditRoadmap, deriveRisk, deriveRoadmap, hasTimeOverlap, latestAcademicActivity } from "./phase5.ts";

const date = (value: string) => new Date(value);
const milestone = (nama: string, urutan: number, status: "BELUM" | "SELESAI") => ({ status, nama, urutan });

assert.equal(hasTimeOverlap(date("1970-01-01T09:00:00Z"), date("1970-01-01T10:00:00Z"), date("1970-01-01T09:30:00Z"), date("1970-01-01T10:30:00Z")), true);
assert.equal(hasTimeOverlap(date("1970-01-01T09:00:00Z"), date("1970-01-01T10:00:00Z"), date("1970-01-01T10:00:00Z"), date("1970-01-01T11:00:00Z")), false);

const now = date("2026-09-30T00:00:00Z");
assert.equal(deriveRisk("ACTIVE", date("2026-09-16T00:00:01Z"), now), "RENDAH");
assert.equal(deriveRisk("ACTIVE", date("2026-09-16T00:00:00Z"), now), "SEDANG");
assert.equal(deriveRisk("ACTIVE", date("2026-09-01T00:00:00Z"), now), "SEDANG");
assert.equal(deriveRisk("ACTIVE", date("2026-08-31T00:00:00Z"), now), "TINGGI");
assert.equal(deriveRisk("COMPLETED", null, now), "SELESAI");
assert.equal(deriveRisk("DRAFT", null, now), "BELUM_AKTIF");
assert.equal(deriveRisk("CANCELLED", null, now), "DIKECUALIKAN");

const twoOfFive = [
  milestone("Roadmap Item A", 1, "SELESAI"),
  milestone("Roadmap Item B", 2, "SELESAI"),
  milestone("Roadmap Item C", 3, "BELUM"),
  milestone("Roadmap Item D", 4, "BELUM"),
  milestone("Roadmap Item E", 5, "BELUM"),
];
assert.equal(deriveRoadmap(twoOfFive).percentage, 40);
assert.equal(deriveRoadmap(twoOfFive).next, "Roadmap Item C");
assert.equal(deriveRoadmap(twoOfFive.map((item) => ({ ...item, status: "SELESAI" as const }))).percentage, 100);
assert.equal(deriveRoadmap([]).percentage, null);
assert.equal(deriveRoadmap([]).next, null);
assert.equal(canEditRoadmap("MAHASISWA", "owner", "owner", "DRAFT"), true);
assert.equal(canEditRoadmap("MAHASISWA", "owner", "owner", "ACTIVE"), true);
assert.equal(canEditRoadmap("MAHASISWA", "other", "owner", "ACTIVE"), false);
assert.equal(canEditRoadmap("DOSEN", "owner", "owner", "ACTIVE"), false);
assert.equal(canEditRoadmap("MAHASISWA", "owner", "owner", "COMPLETED"), false);
assert.equal(canEditRoadmap("MAHASISWA", "owner", "owner", "CANCELLED"), false);
assert.equal(canCompleteTugasAkhir("KOORDINATOR", "ACTIVE"), true);
assert.equal(canCompleteTugasAkhir("MAHASISWA", "ACTIVE"), false);
assert.equal(canCompleteTugasAkhir("DOSEN", "ACTIVE"), false);
assert.equal(canCompleteTugasAkhir("KOORDINATOR", "COMPLETED"), false);
assert.equal(latestAcademicActivity(date("2026-08-01T00:00:00Z"), [date("2026-09-01T00:00:00Z")], [{ submittedAt: date("2026-09-02T00:00:00Z"), reviewedAt: date("2026-09-03T00:00:00Z") }])?.toISOString(), "2026-09-03T00:00:00.000Z");
// TindakLanjut sengaja bukan input helper: catatan Dosen tidak dapat mereset inactivity.
assert.equal(latestAcademicActivity(date("2026-08-01T00:00:00Z"), [], [])?.toISOString(), "2026-08-01T00:00:00.000Z");

const analytics = calculateAnalytics([
  { status: "ACTIVE", milestones: twoOfFive },
  { status: "ACTIVE", milestones: [] },
  { status: "COMPLETED", milestones: twoOfFive.map((item) => ({ ...item, status: "SELESAI" as const })) },
  { status: "DRAFT", milestones: [] },
  { status: "CANCELLED", milestones: [] },
]);
assert.equal(analytics.population, 3);
assert.equal(analytics.averageRoadmapCompletion?.toFixed(1), "70.0");
assert.equal(analytics.completedPercentage.toFixed(1), "33.3");
assert.equal(analytics.withRoadmap, 2);
assert.equal(analytics.withoutRoadmap, 1);
assert.equal(calculateAnalytics([]).population, 0);
assert.equal(calculateAnalytics([]).averageRoadmapCompletion, null);

console.log("Phase 5 deterministic helper tests passed.");
