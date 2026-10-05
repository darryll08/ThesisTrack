import type { PenggunaRole } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

const protectedPrefixes = [
  "/admin",
  "/mahasiswa",
  "/dosen",
  "/koordinator",
  "/change-password",
];

export default {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
        token.prodiId = user.prodiId;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as PenggunaRole;
      session.user.mustChangePassword = token.mustChangePassword === true;
      session.user.prodiId =
        typeof token.prodiId === "string" ? token.prodiId : null;
      return session;
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isProtected = protectedPrefixes.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
      ) || path === "/";

      return !isProtected || Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
