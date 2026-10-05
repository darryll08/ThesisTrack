import Link from "next/link";
import { notFound } from "next/navigation";
import { PenggunaForm } from "@/components/admin/pengguna-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditPenggunaPage({ params }: PageProps<"/admin/pengguna/[id]/edit">) {
  await requireAdmin();

  const { id } = await params;
  const [user, prodis] = await Promise.all([
    prisma.pengguna.findUnique({
      where: { id },
      select: { id: true, nama: true, email: true, role: true, nimNip: true, prodiId: true, status: true },
    }),
    prisma.prodi.findMany({ select: { id: true, kode: true, nama: true }, orderBy: { kode: "asc" } }),
  ]);
  if (!user) notFound();

  return <main><Link href="/admin/pengguna" className="text-sm text-blue-700">← Kembali</Link><section className="mt-4 rounded-lg border border-slate-200 bg-white p-5"><h1 className="mb-5 text-2xl font-bold">Edit pengguna</h1><PenggunaForm user={user} prodis={prodis} /></section></main>;
}
