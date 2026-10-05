-- Preserve every existing enum value while allowing user-defined document names.
ALTER TABLE "dokumen"
ALTER COLUMN "jenis" TYPE VARCHAR(255)
USING "jenis"::text;

DROP TYPE "dokumen_jenis";
