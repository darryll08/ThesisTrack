import Link from "next/link";
import { notFound } from "next/navigation";
import { RuanganForm } from "@/components/admin/ruangan-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditRuanganPage({ params }: PageProps<"/admin/ruangan/[id]/edit">) {
  await requireAdmin();

  const { id } = await params;
  const room = await prisma.ruangan.findUnique({ where: { id }, select: { id: true, kode: true, nama: true, lokasi: true, kapasitas: true, status: true } });
  if (!room) notFound();
  return <main><Link href="/admin/ruangan" className="text-sm text-blue-700">← Kembali</Link><section className="mt-4 rounded-lg border border-slate-200 bg-white p-5"><h1 className="mb-5 text-2xl font-bold">Edit Ruangan</h1><RuanganForm room={room} /></section></main>;
}
