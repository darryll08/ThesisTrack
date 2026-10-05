import type { PenggunaRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: PenggunaRole;
    mustChangePassword: boolean;
    prodiId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: PenggunaRole;
      mustChangePassword: boolean;
      prodiId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: PenggunaRole;
    mustChangePassword: boolean;
    prodiId: string | null;
  }
}
