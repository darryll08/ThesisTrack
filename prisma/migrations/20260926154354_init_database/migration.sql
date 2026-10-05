-- CreateEnum
CREATE TYPE "status_aktif" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "pengguna_role" AS ENUM ('MAHASISWA', 'DOSEN', 'KOORDINATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "tugas_akhir_status" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "pengajuan_topik_status" AS ENUM ('MENUNGGU', 'DISETUJUI', 'PERLU_REVISI');

-- CreateEnum
CREATE TYPE "ta_milestone_status" AS ENUM ('BELUM', 'SELESAI');

-- CreateEnum
CREATE TYPE "bimbingan_status" AS ENUM ('MENUNGGU', 'TERVALIDASI', 'PERLU_REVISI');

-- CreateEnum
CREATE TYPE "dokumen_jenis" AS ENUM ('PROPOSAL', 'BAB_1_3', 'BAB_4', 'BAB_5', 'SEMINAR_HASIL', 'SIDANG', 'LAINNYA');

-- CreateEnum
CREATE TYPE "dokumen_status" AS ENUM ('MENUNGGU_REVIEW', 'TERVERIFIKASI', 'PERLU_REVISI');

-- CreateEnum
CREATE TYPE "personal_task_tipe" AS ENUM ('THESIS', 'STUDY', 'PERSONAL');

-- CreateEnum
CREATE TYPE "personal_task_status" AS ENUM ('TODO', 'IN_PROGRESS', 'SELESAI');

-- CreateEnum
CREATE TYPE "ujian_ta_jenis" AS ENUM ('SEMINAR_PROPOSAL', 'SEMINAR_HASIL', 'SIDANG');

-- CreateEnum
CREATE TYPE "ujian_ta_status" AS ENUM ('DRAFT', 'TERJADWAL', 'SELESAI', 'DIBATALKAN');

-- CreateTable
CREATE TABLE "prodi" (
    "id" UUID NOT NULL,
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "status" "status_aktif" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengguna" (
    "id" UUID NOT NULL,
    "prodi_id" UUID,
    "nama" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "pengguna_role" NOT NULL,
    "nim_nip" VARCHAR(50),
    "status" "status_aktif" NOT NULL DEFAULT 'ACTIVE',
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas_akhir" (
    "id" UUID NOT NULL,
    "mahasiswa_id" UUID NOT NULL,
    "judul_final" TEXT,
    "status" "tugas_akhir_status" NOT NULL DEFAULT 'DRAFT',
    "tanggal_mulai" DATE,
    "tanggal_selesai" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tugas_akhir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_topik" (
    "id" UUID NOT NULL,
    "tugas_akhir_id" UUID NOT NULL,
    "validator_id" UUID,
    "judul" TEXT NOT NULL,
    "bidang" VARCHAR(255),
    "status" "pengajuan_topik_status" NOT NULL DEFAULT 'MENUNGGU',
    "catatan" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengajuan_topik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembimbing" (
    "id" UUID NOT NULL,
    "tugas_akhir_id" UUID NOT NULL,
    "dosen_id" UUID NOT NULL,
    "urutan" SMALLINT NOT NULL,
    "status" "status_aktif" NOT NULL DEFAULT 'ACTIVE',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "pembimbing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_milestone" (
    "id" UUID NOT NULL,
    "kode" VARCHAR(30) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "bobot" SMALLINT NOT NULL,
    "urutan" SMALLINT NOT NULL,
    "status" "status_aktif" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ta_milestone" (
    "id" UUID NOT NULL,
    "tugas_akhir_id" UUID NOT NULL,
    "master_milestone_id" UUID NOT NULL,
    "status" "ta_milestone_status" NOT NULL DEFAULT 'BELUM',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ta_milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bimbingan" (
    "id" UUID NOT NULL,
    "pembimbing_id" UUID NOT NULL,
    "ta_milestone_id" UUID NOT NULL,
    "dokumen_id" UUID,
    "tanggal" DATE NOT NULL,
    "topik" TEXT NOT NULL,
    "status" "bimbingan_status" NOT NULL DEFAULT 'MENUNGGU',
    "feedback" TEXT,
    "revision_item" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bimbingan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen" (
    "id" UUID NOT NULL,
    "tugas_akhir_id" UUID NOT NULL,
    "nama_file" VARCHAR(255) NOT NULL,
    "jenis" "dokumen_jenis" NOT NULL,
    "versi" INTEGER NOT NULL DEFAULT 1,
    "status" "dokumen_status" NOT NULL DEFAULT 'MENUNGGU_REVIEW',
    "storage_path" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_task" (
    "id" UUID NOT NULL,
    "pemilik_id" UUID NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "tipe" "personal_task_tipe" NOT NULL,
    "due_date" DATE,
    "status" "personal_task_status" NOT NULL DEFAULT 'TODO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tindak_lanjut" (
    "id" UUID NOT NULL,
    "tugas_akhir_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "catatan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tindak_lanjut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruangan" (
    "id" UUID NOT NULL,
    "kode" VARCHAR(30) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "lokasi" VARCHAR(255) NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "status" "status_aktif" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ujian_ta" (
    "id" UUID NOT NULL,
    "tugas_akhir_id" UUID NOT NULL,
    "ruangan_id" UUID NOT NULL,
    "jenis" "ujian_ta_jenis" NOT NULL,
    "tanggal" DATE NOT NULL,
    "jam_mulai" TIME(0) NOT NULL,
    "jam_selesai" TIME(0) NOT NULL,
    "status" "ujian_ta_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ujian_ta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prodi_kode_key" ON "prodi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_nim_nip_key" ON "pengguna"("nim_nip");

-- CreateIndex
CREATE INDEX "pengguna_prodi_id_role_status_idx" ON "pengguna"("prodi_id", "role", "status");

-- CreateIndex
CREATE INDEX "tugas_akhir_mahasiswa_id_status_idx" ON "tugas_akhir"("mahasiswa_id", "status");

-- CreateIndex
CREATE INDEX "pengajuan_topik_tugas_akhir_id_status_idx" ON "pengajuan_topik"("tugas_akhir_id", "status");

-- CreateIndex
CREATE INDEX "pengajuan_topik_validator_id_idx" ON "pengajuan_topik"("validator_id");

-- CreateIndex
CREATE INDEX "pembimbing_tugas_akhir_id_status_idx" ON "pembimbing"("tugas_akhir_id", "status");

-- CreateIndex
CREATE INDEX "pembimbing_dosen_id_status_idx" ON "pembimbing"("dosen_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pembimbing_tugas_akhir_id_dosen_id_assigned_at_key" ON "pembimbing"("tugas_akhir_id", "dosen_id", "assigned_at");

-- CreateIndex
CREATE UNIQUE INDEX "master_milestone_kode_key" ON "master_milestone"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "master_milestone_urutan_key" ON "master_milestone"("urutan");

-- CreateIndex
CREATE INDEX "ta_milestone_master_milestone_id_idx" ON "ta_milestone"("master_milestone_id");

-- CreateIndex
CREATE UNIQUE INDEX "ta_milestone_tugas_akhir_id_master_milestone_id_key" ON "ta_milestone"("tugas_akhir_id", "master_milestone_id");

-- CreateIndex
CREATE INDEX "bimbingan_pembimbing_id_status_idx" ON "bimbingan"("pembimbing_id", "status");

-- CreateIndex
CREATE INDEX "bimbingan_ta_milestone_id_status_idx" ON "bimbingan"("ta_milestone_id", "status");

-- CreateIndex
CREATE INDEX "bimbingan_dokumen_id_idx" ON "bimbingan"("dokumen_id");

-- CreateIndex
CREATE INDEX "dokumen_tugas_akhir_id_status_idx" ON "dokumen"("tugas_akhir_id", "status");

-- CreateIndex
CREATE INDEX "personal_task_pemilik_id_status_idx" ON "personal_task"("pemilik_id", "status");

-- CreateIndex
CREATE INDEX "tindak_lanjut_tugas_akhir_id_created_at_idx" ON "tindak_lanjut"("tugas_akhir_id", "created_at");

-- CreateIndex
CREATE INDEX "tindak_lanjut_author_id_idx" ON "tindak_lanjut"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "ruangan_kode_key" ON "ruangan"("kode");

-- CreateIndex
CREATE INDEX "ujian_ta_tugas_akhir_id_status_idx" ON "ujian_ta"("tugas_akhir_id", "status");

-- CreateIndex
CREATE INDEX "ujian_ta_ruangan_id_tanggal_jam_mulai_jam_selesai_idx" ON "ujian_ta"("ruangan_id", "tanggal", "jam_mulai", "jam_selesai");

-- AddForeignKey
ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas_akhir" ADD CONSTRAINT "tugas_akhir_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_topik" ADD CONSTRAINT "pengajuan_topik_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "tugas_akhir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_topik" ADD CONSTRAINT "pengajuan_topik_validator_id_fkey" FOREIGN KEY ("validator_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembimbing" ADD CONSTRAINT "pembimbing_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "tugas_akhir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembimbing" ADD CONSTRAINT "pembimbing_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ta_milestone" ADD CONSTRAINT "ta_milestone_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "tugas_akhir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ta_milestone" ADD CONSTRAINT "ta_milestone_master_milestone_id_fkey" FOREIGN KEY ("master_milestone_id") REFERENCES "master_milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bimbingan" ADD CONSTRAINT "bimbingan_pembimbing_id_fkey" FOREIGN KEY ("pembimbing_id") REFERENCES "pembimbing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bimbingan" ADD CONSTRAINT "bimbingan_ta_milestone_id_fkey" FOREIGN KEY ("ta_milestone_id") REFERENCES "ta_milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bimbingan" ADD CONSTRAINT "bimbingan_dokumen_id_fkey" FOREIGN KEY ("dokumen_id") REFERENCES "dokumen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen" ADD CONSTRAINT "dokumen_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "tugas_akhir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_task" ADD CONSTRAINT "personal_task_pemilik_id_fkey" FOREIGN KEY ("pemilik_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tindak_lanjut" ADD CONSTRAINT "tindak_lanjut_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "tugas_akhir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tindak_lanjut" ADD CONSTRAINT "tindak_lanjut_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ujian_ta" ADD CONSTRAINT "ujian_ta_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "tugas_akhir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ujian_ta" ADD CONSTRAINT "ujian_ta_ruangan_id_fkey" FOREIGN KEY ("ruangan_id") REFERENCES "ruangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
