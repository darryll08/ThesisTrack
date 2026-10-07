import {
  BimbinganStatus,
  DokumenStatus,
  PengajuanTopikStatus,
  PenggunaRole,
  PersonalTaskStatus,
  PersonalTaskTipe,
  PrismaClient,
  StatusAktif,
  TaMilestoneStatus,
  TugasAkhirStatus,
  UjianTaJenis,
  UjianTaStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const ids = {
  tugasAkhirDraft: "00000000-0000-4000-8000-000000000001",
  tugasAkhirActive: "00000000-0000-4000-8000-000000000002",
  pengajuanDraft: "00000000-0000-4000-8000-000000000003",
  pengajuanApproved: "00000000-0000-4000-8000-000000000004",
  pembimbingSatu: "00000000-0000-4000-8000-000000000005",
  pembimbingDua: "00000000-0000-4000-8000-000000000006",
  dokumenProposal: "00000000-0000-4000-8000-000000000007",
  bimbinganProposal: "00000000-0000-4000-8000-000000000008",
  tindakLanjut: "00000000-0000-4000-8000-000000000009",
  ujianProposal: "00000000-0000-4000-8000-000000000010",
  taskDraft: "00000000-0000-4000-8000-000000000011",
  taskActive: "00000000-0000-4000-8000-000000000012",
  obsoleteBimbinganJudul: "00000000-0000-4000-8000-000000000013",
  roadmapA: "00000000-0000-4000-8000-000000000014",
  roadmapB: "00000000-0000-4000-8000-000000000015",
};

async function main() {
  const demoPassword = process.env.DEMO_SEED_PASSWORD;
  if (!demoPassword?.trim()) {
    throw new Error("Development seed memerlukan DEMO_SEED_PASSWORD.");
  }

  const developmentPasswordHash = await hash(demoPassword, 12);
  const prodiTsd = await prisma.prodi.upsert({
    where: { kode: "TSD" },
    update: { nama: "Teknologi Sains Data", status: StatusAktif.ACTIVE },
    create: { kode: "TSD", nama: "Teknologi Sains Data" },
  });

  await prisma.prodi.upsert({
    where: { kode: "TRKB" },
    update: {
      nama: "Teknik Robotika dan Kecerdasan Buatan",
      status: StatusAktif.ACTIVE,
    },
    create: { kode: "TRKB", nama: "Teknik Robotika dan Kecerdasan Buatan" },
  });

  await prisma.prodi.upsert({
    where: { kode: "TI" },
    update: { nama: "Teknik Industri", status: StatusAktif.ACTIVE },
    create: { kode: "TI", nama: "Teknik Industri" },
  });

  const admin = await prisma.pengguna.upsert({
    where: { email: "admin@thesistrack.local" },
    update: {
      nama: "Admin ThesisTrack",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.ADMIN,
      status: StatusAktif.ACTIVE,
      mustChangePassword: true,
      prodiId: null,
      nimNip: null,
    },
    create: {
      nama: "Admin ThesisTrack",
      email: "admin@thesistrack.local",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.ADMIN,
      mustChangePassword: true,
    },
  });

  const koordinator = await prisma.pengguna.upsert({
    where: { email: "koordinator.tsd@thesistrack.local" },
    update: {
      nama: "Koordinator TSD",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.KOORDINATOR,
      nimNip: "198001012010121001",
      prodiId: prodiTsd.id,
      status: StatusAktif.ACTIVE,
      mustChangePassword: true,
    },
    create: {
      nama: "Koordinator TSD",
      email: "koordinator.tsd@thesistrack.local",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.KOORDINATOR,
      nimNip: "198001012010121001",
      prodiId: prodiTsd.id,
    },
  });

  const dosenSatu = await prisma.pengguna.upsert({
    where: { email: "dosen.satu@thesistrack.local" },
    update: {
      nama: "Dr. Dosen Pembimbing Satu",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.DOSEN,
      nimNip: "198502022012121002",
      prodiId: prodiTsd.id,
      status: StatusAktif.ACTIVE,
      mustChangePassword: true,
    },
    create: {
      nama: "Dr. Dosen Pembimbing Satu",
      email: "dosen.satu@thesistrack.local",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.DOSEN,
      nimNip: "198502022012121002",
      prodiId: prodiTsd.id,
    },
  });

  const dosenDua = await prisma.pengguna.upsert({
    where: { email: "dosen.dua@thesistrack.local" },
    update: {
      nama: "Dr. Dosen Pembimbing Dua",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.DOSEN,
      nimNip: "198603032013121003",
      prodiId: prodiTsd.id,
      status: StatusAktif.ACTIVE,
      mustChangePassword: true,
    },
    create: {
      nama: "Dr. Dosen Pembimbing Dua",
      email: "dosen.dua@thesistrack.local",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.DOSEN,
      nimNip: "198603032013121003",
      prodiId: prodiTsd.id,
    },
  });

  const mahasiswaDraft = await prisma.pengguna.upsert({
    where: { email: "mahasiswa.draft@thesistrack.local" },
    update: {
      nama: "Mahasiswa Draft",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.MAHASISWA,
      nimNip: "164221001",
      prodiId: prodiTsd.id,
      status: StatusAktif.ACTIVE,
      mustChangePassword: true,
    },
    create: {
      nama: "Mahasiswa Draft",
      email: "mahasiswa.draft@thesistrack.local",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.MAHASISWA,
      nimNip: "164221001",
      prodiId: prodiTsd.id,
    },
  });

  const mahasiswaActive = await prisma.pengguna.upsert({
    where: { email: "mahasiswa.active@thesistrack.local" },
    update: {
      nama: "Mahasiswa Active",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.MAHASISWA,
      nimNip: "164221002",
      prodiId: prodiTsd.id,
      status: StatusAktif.ACTIVE,
      mustChangePassword: true,
    },
    create: {
      nama: "Mahasiswa Active",
      email: "mahasiswa.active@thesistrack.local",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.MAHASISWA,
      nimNip: "164221002",
      prodiId: prodiTsd.id,
    },
  });

  await prisma.pengguna.upsert({
    where: { email: "mahasiswa.demo@thesistrack.local" },
    update: {
      nama: "Mahasiswa Demo",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.MAHASISWA,
      nimNip: "164221003",
      prodiId: prodiTsd.id,
      status: StatusAktif.ACTIVE,
      mustChangePassword: true,
    },
    create: {
      nama: "Mahasiswa Demo",
      email: "mahasiswa.demo@thesistrack.local",
      passwordHash: developmentPasswordHash,
      role: PenggunaRole.MAHASISWA,
      nimNip: "164221003",
      prodiId: prodiTsd.id,
    },
  });

  const ruangSidang = await prisma.ruangan.upsert({
    where: { kode: "FTMM-301" },
    update: {
      nama: "Ruang Sidang 301",
      lokasi: "Gedung FTMM Lantai 3",
      kapasitas: 20,
      status: StatusAktif.ACTIVE,
    },
    create: {
      kode: "FTMM-301",
      nama: "Ruang Sidang 301",
      lokasi: "Gedung FTMM Lantai 3",
      kapasitas: 20,
    },
  });

  await prisma.ruangan.upsert({
    where: { kode: "FTMM-302" },
    update: {
      nama: "Ruang Sidang 302",
      lokasi: "Gedung FTMM Lantai 3",
      kapasitas: 20,
      status: StatusAktif.ACTIVE,
    },
    create: {
      kode: "FTMM-302",
      nama: "Ruang Sidang 302",
      lokasi: "Gedung FTMM Lantai 3",
      kapasitas: 20,
    },
  });

  const tugasAkhirDraft = await prisma.tugasAkhir.upsert({
    where: { id: ids.tugasAkhirDraft },
    update: {
      mahasiswaId: mahasiswaDraft.id,
      judulFinal: null,
      status: TugasAkhirStatus.DRAFT,
      tanggalMulai: null,
      tanggalSelesai: null,
    },
    create: {
      id: ids.tugasAkhirDraft,
      mahasiswaId: mahasiswaDraft.id,
      status: TugasAkhirStatus.DRAFT,
    },
  });

  const tugasAkhirActive = await prisma.tugasAkhir.upsert({
    where: { id: ids.tugasAkhirActive },
    update: {
      mahasiswaId: mahasiswaActive.id,
      judulFinal:
        "Prediksi Risiko Keterlambatan Tugas Akhir Berbasis Data Akademik",
      status: TugasAkhirStatus.ACTIVE,
      tanggalMulai: new Date("2026-08-01T00:00:00.000Z"),
      tanggalSelesai: null,
    },
    create: {
      id: ids.tugasAkhirActive,
      mahasiswaId: mahasiswaActive.id,
      judulFinal:
        "Prediksi Risiko Keterlambatan Tugas Akhir Berbasis Data Akademik",
      status: TugasAkhirStatus.ACTIVE,
      tanggalMulai: new Date("2026-08-01T00:00:00.000Z"),
    },
  });

  await prisma.pengajuanTopik.upsert({
    where: { id: ids.pengajuanDraft },
    update: {
      tugasAkhirId: tugasAkhirDraft.id,
      validatorId: null,
      judul: "Analisis Sentimen Layanan Akademik FTMM",
      bidang: "Natural Language Processing",
      status: PengajuanTopikStatus.MENUNGGU,
      catatan: null,
      decidedAt: null,
    },
    create: {
      id: ids.pengajuanDraft,
      tugasAkhirId: tugasAkhirDraft.id,
      judul: "Analisis Sentimen Layanan Akademik FTMM",
      bidang: "Natural Language Processing",
    },
  });

  await prisma.pengajuanTopik.upsert({
    where: { id: ids.pengajuanApproved },
    update: {
      tugasAkhirId: tugasAkhirActive.id,
      validatorId: dosenSatu.id,
      judul: tugasAkhirActive.judulFinal!,
      bidang: "Data Mining",
      status: PengajuanTopikStatus.DISETUJUI,
      catatan: "Topik disetujui untuk dilanjutkan.",
      decidedAt: new Date("2026-08-01T09:00:00.000Z"),
    },
    create: {
      id: ids.pengajuanApproved,
      tugasAkhirId: tugasAkhirActive.id,
      validatorId: dosenSatu.id,
      judul: tugasAkhirActive.judulFinal!,
      bidang: "Data Mining",
      status: PengajuanTopikStatus.DISETUJUI,
      catatan: "Topik disetujui untuk dilanjutkan.",
      decidedAt: new Date("2026-08-01T09:00:00.000Z"),
    },
  });

  const pembimbingSatu = await prisma.pembimbing.upsert({
    where: { id: ids.pembimbingSatu },
    update: {
      tugasAkhirId: tugasAkhirActive.id,
      dosenId: dosenSatu.id,
      urutan: 1,
      status: StatusAktif.ACTIVE,
      endedAt: null,
    },
    create: {
      id: ids.pembimbingSatu,
      tugasAkhirId: tugasAkhirActive.id,
      dosenId: dosenSatu.id,
      urutan: 1,
    },
  });

  await prisma.pembimbing.upsert({
    where: { id: ids.pembimbingDua },
    update: {
      tugasAkhirId: tugasAkhirActive.id,
      dosenId: dosenDua.id,
      urutan: 2,
      status: StatusAktif.ACTIVE,
      endedAt: null,
    },
    create: {
      id: ids.pembimbingDua,
      tugasAkhirId: tugasAkhirActive.id,
      dosenId: dosenDua.id,
      urutan: 2,
    },
  });

  await prisma.bimbingan.deleteMany({
    where: { id: ids.obsoleteBimbinganJudul },
  });

  const roadmapA = await prisma.taMilestone.upsert({
    where: { id: ids.roadmapA },
    update: { tugasAkhirId: tugasAkhirActive.id, nama: "Roadmap Item A", urutan: 1, status: TaMilestoneStatus.SELESAI, completedAt: new Date("2026-09-10T10:00:00.000Z"), masterMilestoneId: null },
    create: { id: ids.roadmapA, tugasAkhirId: tugasAkhirActive.id, nama: "Roadmap Item A", urutan: 1, status: TaMilestoneStatus.SELESAI, completedAt: new Date("2026-09-10T10:00:00.000Z") },
  });
  await prisma.taMilestone.upsert({
    where: { id: ids.roadmapB },
    update: { tugasAkhirId: tugasAkhirActive.id, nama: "Roadmap Item B", urutan: 2, status: TaMilestoneStatus.BELUM, completedAt: null, masterMilestoneId: null },
    create: { id: ids.roadmapB, tugasAkhirId: tugasAkhirActive.id, nama: "Roadmap Item B", urutan: 2 },
  });

  const dokumenProposal = await prisma.dokumen.upsert({
    where: { id: ids.dokumenProposal },
    update: {
      tugasAkhirId: tugasAkhirActive.id,
      namaFile: "proposal-mahasiswa-active-v1.pdf",
      jenis: "PROPOSAL",
      versi: 1,
      status: DokumenStatus.TERVERIFIKASI,
      storagePath: null,
    },
    create: {
      id: ids.dokumenProposal,
      tugasAkhirId: tugasAkhirActive.id,
      namaFile: "proposal-mahasiswa-active-v1.pdf",
      jenis: "PROPOSAL",
      versi: 1,
      status: DokumenStatus.TERVERIFIKASI,
    },
  });

  await prisma.bimbingan.upsert({
    where: { id: ids.bimbinganProposal },
    update: {
      pembimbingId: pembimbingSatu.id,
      taMilestoneId: roadmapA.id,
      dokumenId: dokumenProposal.id,
      tanggal: new Date("2026-09-10T00:00:00.000Z"),
      topik: "Review final proposal",
      status: BimbinganStatus.TERVALIDASI,
      feedback: "Proposal sudah layak untuk seminar.",
      revisionItem: null,
      reviewedAt: new Date("2026-09-10T10:00:00.000Z"),
    },
    create: {
      id: ids.bimbinganProposal,
      pembimbingId: pembimbingSatu.id,
      taMilestoneId: roadmapA.id,
      dokumenId: dokumenProposal.id,
      tanggal: new Date("2026-09-10T00:00:00.000Z"),
      topik: "Review final proposal",
      status: BimbinganStatus.TERVALIDASI,
      feedback: "Proposal sudah layak untuk seminar.",
      reviewedAt: new Date("2026-09-10T10:00:00.000Z"),
    },
  });

  await prisma.personalTask.upsert({
    where: { id: ids.taskDraft },
    update: {
      pemilikId: mahasiswaDraft.id,
      nama: "Finalisasi rumusan masalah",
      tipe: PersonalTaskTipe.THESIS,
      dueDate: new Date("2026-10-05T00:00:00.000Z"),
      status: PersonalTaskStatus.TODO,
    },
    create: {
      id: ids.taskDraft,
      pemilikId: mahasiswaDraft.id,
      nama: "Finalisasi rumusan masalah",
      tipe: PersonalTaskTipe.THESIS,
      dueDate: new Date("2026-10-05T00:00:00.000Z"),
    },
  });

  await prisma.personalTask.upsert({
    where: { id: ids.taskActive },
    update: {
      pemilikId: mahasiswaActive.id,
      nama: "Siapkan materi seminar hasil",
      tipe: PersonalTaskTipe.THESIS,
      dueDate: new Date("2026-10-12T00:00:00.000Z"),
      status: PersonalTaskStatus.IN_PROGRESS,
    },
    create: {
      id: ids.taskActive,
      pemilikId: mahasiswaActive.id,
      nama: "Siapkan materi seminar hasil",
      tipe: PersonalTaskTipe.THESIS,
      dueDate: new Date("2026-10-12T00:00:00.000Z"),
      status: PersonalTaskStatus.IN_PROGRESS,
    },
  });

  await prisma.tindakLanjut.upsert({
    where: { id: ids.tindakLanjut },
    update: {
      tugasAkhirId: tugasAkhirActive.id,
      authorId: dosenSatu.id,
      catatan: "Mahasiswa perlu menyiapkan materi seminar hasil.",
    },
    create: {
      id: ids.tindakLanjut,
      tugasAkhirId: tugasAkhirActive.id,
      authorId: dosenSatu.id,
      catatan: "Mahasiswa perlu menyiapkan materi seminar hasil.",
    },
  });

  await prisma.ujianTa.upsert({
    where: { id: ids.ujianProposal },
    update: {
      tugasAkhirId: tugasAkhirActive.id,
      ruanganId: ruangSidang.id,
      jenis: UjianTaJenis.SEMINAR_HASIL,
      tanggal: new Date("2026-10-15T00:00:00.000Z"),
      jamMulai: new Date("1970-01-01T09:00:00.000Z"),
      jamSelesai: new Date("1970-01-01T10:30:00.000Z"),
      status: UjianTaStatus.TERJADWAL,
    },
    create: {
      id: ids.ujianProposal,
      tugasAkhirId: tugasAkhirActive.id,
      ruanganId: ruangSidang.id,
      jenis: UjianTaJenis.SEMINAR_HASIL,
      tanggal: new Date("2026-10-15T00:00:00.000Z"),
      jamMulai: new Date("1970-01-01T09:00:00.000Z"),
      jamSelesai: new Date("1970-01-01T10:30:00.000Z"),
      status: UjianTaStatus.TERJADWAL,
    },
  });

  console.log(
    `Seed complete: ${admin.email}, ${koordinator.email}, flexible roadmap, 2 Thesis records.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
