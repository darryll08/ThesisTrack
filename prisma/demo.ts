import { PenggunaRole, PrismaClient, StatusAktif } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const action = process.argv[2];
const adminEmail = "admin@thesistrack.local";
const tableNames = [
  "PRODI",
  "PENGGUNA",
  "TUGAS_AKHIR",
  "PENGAJUAN_TOPIK",
  "PEMBIMBING",
  "MASTER_MILESTONE",
  "TA_MILESTONE",
  "BIMBINGAN",
  "DOKUMEN",
  "PERSONAL_TASK",
  "TINDAK_LANJUT",
  "RUANGAN",
  "UJIAN_TA",
] as const;

async function counts() {
  const values = await Promise.all([
    prisma.prodi.count(),
    prisma.pengguna.count(),
    prisma.tugasAkhir.count(),
    prisma.pengajuanTopik.count(),
    prisma.pembimbing.count(),
    prisma.masterMilestone.count(),
    prisma.taMilestone.count(),
    prisma.bimbingan.count(),
    prisma.dokumen.count(),
    prisma.personalTask.count(),
    prisma.tindakLanjut.count(),
    prisma.ruangan.count(),
    prisma.ujianTa.count(),
  ]);
  return Object.fromEntries(tableNames.map((name, index) => [name, values[index]]));
}

async function status() {
  const result = await counts();
  const admin = await prisma.pengguna.findUnique({
    where: { email: adminEmail },
    select: {
      nama: true,
      email: true,
      role: true,
      status: true,
      prodiId: true,
      nimNip: true,
      mustChangePassword: true,
    },
  });
  const clean =
    tableNames.every((name) => result[name] === (name === "PENGGUNA" ? 1 : 0)) &&
    admin?.nama === "Admin ThesisTrack" &&
    admin.email === adminEmail &&
    admin.role === PenggunaRole.ADMIN &&
    admin.status === StatusAktif.ACTIVE &&
    admin.prodiId === null &&
    admin.nimNip === null &&
    admin.mustChangePassword === false;

  for (const name of tableNames) console.log(`${name} = ${result[name]}`);
  console.log(clean ? "READY" : "NOT CLEAN");
  if (!clean) process.exitCode = 1;
}

async function reset() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    throw new Error("Demo reset ditolak pada environment production.");
  }
  if (process.env.ALLOW_DEMO_RESET !== "true") {
    throw new Error('Demo reset memerlukan ALLOW_DEMO_RESET="true".');
  }

  const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD;
  if (!demoAdminPassword?.trim()) {
    throw new Error("Demo reset memerlukan DEMO_ADMIN_PASSWORD.");
  }

  const passwordHash = await hash(demoAdminPassword, 12);
  await prisma.$transaction(async (tx) => {
    await tx.bimbingan.deleteMany();
    await tx.ujianTa.deleteMany();
    await tx.dokumen.deleteMany();
    await tx.taMilestone.deleteMany();
    await tx.masterMilestone.deleteMany();
    await tx.pembimbing.deleteMany();
    await tx.pengajuanTopik.deleteMany();
    await tx.personalTask.deleteMany();
    await tx.tindakLanjut.deleteMany();
    await tx.tugasAkhir.deleteMany();
    await tx.ruangan.deleteMany();
    await tx.pengguna.deleteMany();
    await tx.prodi.deleteMany();
    await tx.pengguna.create({
      data: {
        nama: "Admin ThesisTrack",
        email: adminEmail,
        passwordHash,
        role: PenggunaRole.ADMIN,
        status: StatusAktif.ACTIVE,
        prodiId: null,
        nimNip: null,
        mustChangePassword: false,
      },
    });
  });
  await status();
}

async function main() {
  if (action === "reset") return reset();
  if (action === "status") return status();
  throw new Error("Gunakan mode reset atau status.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Demo command gagal.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
