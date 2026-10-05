import Link from "next/link";
import { notFound } from "next/navigation";
import { ProdiForm } from "@/components/admin/prodi-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditProdiPage({ params }: PageProps<"/admin/prodi/[id]/edit">) {
  await requireAdmin();

  const { id } = await params;
  const prodi = await prisma.prodi.findUnique({ where: { id }, select: { id: true, kode: true, nama: true, status: true } });
  if (!prodi) notFound();
  return <main><Link href="/admin/prodi" className="text-sm text-blue-700">← Kembali</Link><section className="mt-4 rounded-lg border border-slate-200 bg-white p-5"><h1 className="mb-5 text-2xl font-bold">Edit Program Studi</h1><ProdiForm prodi={prodi} /></section></main>;
}
