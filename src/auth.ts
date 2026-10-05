import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validations/auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.pengguna.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            nama: true,
            email: true,
            passwordHash: true,
            role: true,
            status: true,
            mustChangePassword: true,
            prodiId: true,
          },
        });

        if (!user || user.status !== "ACTIVE") return null;
        if (!(await compare(parsed.data.password, user.passwordHash))) return null;

        return {
          id: user.id,
          name: user.nama,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          prodiId: user.prodiId,
        };
      },
    }),
  ],
});
