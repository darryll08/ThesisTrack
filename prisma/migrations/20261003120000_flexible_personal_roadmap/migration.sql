-- Preserve existing development roadmap data while making each item self-contained.
ALTER TABLE "ta_milestone" ADD COLUMN "nama" VARCHAR(255);
ALTER TABLE "ta_milestone" ADD COLUMN "urutan" SMALLINT;

UPDATE "ta_milestone" AS tm
SET "nama" = mm."nama", "urutan" = mm."urutan"
FROM "master_milestone" AS mm
WHERE tm."master_milestone_id" = mm."id";

ALTER TABLE "ta_milestone" ALTER COLUMN "nama" SET NOT NULL;
ALTER TABLE "ta_milestone" ALTER COLUMN "urutan" SET NOT NULL;
ALTER TABLE "ta_milestone" ALTER COLUMN "master_milestone_id" DROP NOT NULL;
ALTER TABLE "bimbingan" ALTER COLUMN "ta_milestone_id" DROP NOT NULL;

DROP INDEX "ta_milestone_tugas_akhir_id_master_milestone_id_key";
CREATE UNIQUE INDEX "ta_milestone_tugas_akhir_id_urutan_key"
ON "ta_milestone"("tugas_akhir_id", "urutan");

ALTER TABLE "ta_milestone" DROP CONSTRAINT "ta_milestone_master_milestone_id_fkey";
ALTER TABLE "ta_milestone" ADD CONSTRAINT "ta_milestone_master_milestone_id_fkey"
FOREIGN KEY ("master_milestone_id") REFERENCES "master_milestone"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bimbingan" DROP CONSTRAINT "bimbingan_ta_milestone_id_fkey";
ALTER TABLE "bimbingan" ADD CONSTRAINT "bimbingan_ta_milestone_id_fkey"
FOREIGN KEY ("ta_milestone_id") REFERENCES "ta_milestone"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "master_milestone" DROP COLUMN "bobot";
