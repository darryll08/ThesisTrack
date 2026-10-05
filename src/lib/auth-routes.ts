import type { PenggunaRole } from "@prisma/client";

export const roleHome: Record<PenggunaRole, string> = {
  MAHASISWA: "/mahasiswa",
  DOSEN: "/dosen",
  KOORDINATOR: "/koordinator",
  ADMIN: "/admin",
};
