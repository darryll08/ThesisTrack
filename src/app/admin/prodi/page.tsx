import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { deleteProdiAction, toggleProdiStatusAction } from "@/actions/prodi";
import { ProdiForm } from "@/components/admin/prodi-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProdiPage({ searchParams }: PageProps<"/admin/prodi">) {
  await requireAdmin();

  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const prodis = await prisma.prodi.findMany({
    where: query ? { OR: [{ kode: { contains: query, mode: "insensitive" } }, { nama: { contains: query, mode: "insensitive" } }] } : undefined,
    include: { _count: { select: { pengguna: true } } },
    orderBy: { kode: "asc" },
  });

  return (
    <main className="space-y-8">
      <PageHeader eyebrow="ADMINISTRASI SISTEM" title="Program Studi" description="Kelola referensi program studi di lingkungan FTMM." />
      {typeof params.message === "string" ? <p className="rounded bg-green-50 p-3 text-sm text-green-800">{params.message}</p> : null}
      {typeof params.error === "string" ? <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{params.error}</p> : null}
      <section className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="mb-4 text-lg font-semibold">Tambah Program Studi</h2><ProdiForm /></section>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><h2 className="text-lg font-semibold">Daftar Program Studi</h2><form className="flex gap-2"><label htmlFor="q" className="sr-only">Cari Program Studi</label><input id="q" name="q" defaultValue={query} placeholder="Kode atau nama" className="rounded border border-slate-300 px-3 py-2" /><button className="rounded border border-slate-300 px-3 py-2">Cari</button></form></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Kode</th><th className="p-2">Nama</th><th className="p-2">Status</th><th className="p-2">Pengguna</th><th className="p-2">Aksi</th></tr></thead><tbody>
          {prodis.map((prodi) => <tr key={prodi.id} className="border-b border-slate-100 align-top"><td className="p-2 font-medium">{prodi.kode}</td><td className="p-2">{prodi.nama}</td><td className="p-2"><StatusBadge status={prodi.status} /></td><td className="p-2">{prodi._count.pengguna}</td><td className="p-2"><div className="flex items-start gap-2"><Link href={`/admin/prodi/${prodi.id}/edit`} className="rounded border border-slate-300 px-3 py-1.5">Edit</Link><details><summary className="cursor-pointer rounded border border-slate-300 px-3 py-1.5">Aksi</summary><div className="mt-2 w-52 space-y-2 rounded border bg-white p-3 shadow"><form action={toggleProdiStatusAction}><input type="hidden" name="id" value={prodi.id} /><SubmitButton className="w-full rounded bg-amber-600 px-3 py-1.5 text-white disabled:opacity-60">Ubah status</SubmitButton></form><form action={deleteProdiAction}><input type="hidden" name="id" value={prodi.id} /><SubmitButton className="w-full rounded bg-red-700 px-3 py-1.5 text-white disabled:opacity-60" pendingLabel="Menghapus...">Hapus</SubmitButton></form></div></details></div></td></tr>)}
        </tbody></table></div>
      </section>
    </main>
  );
}
