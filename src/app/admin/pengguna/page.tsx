import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { togglePenggunaStatusAction } from "@/actions/pengguna";
import { PenggunaForm } from "@/components/admin/pengguna-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PenggunaPage({ searchParams }: PageProps<"/admin/pengguna">) {
  await requireAdmin();

  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const [users, prodis] = await Promise.all([
    prisma.pengguna.findMany({
      where: query
        ? {
            OR: [
              { nama: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { nimNip: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        nimNip: true,
        status: true,
        prodi: { select: { kode: true } },
      },
      orderBy: { nama: "asc" },
    }),
    prisma.prodi.findMany({
      select: { id: true, kode: true, nama: true },
      orderBy: { kode: "asc" },
    }),
  ]);

  return (
    <main className="space-y-8">
      <PageHeader eyebrow="ADMINISTRASI SISTEM" title="Pengguna" description="Kelola identitas, peran, dan status akses pengguna." />
      {typeof params.message === "string" ? <p className="rounded bg-green-50 p-3 text-sm text-green-800">{params.message}</p> : null}
      {typeof params.error === "string" ? <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{params.error}</p> : null}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Tambah pengguna</h2>
        <PenggunaForm prodis={prodis} />
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold">Daftar pengguna</h2>
          <form className="flex gap-2">
            <div><label htmlFor="q" className="sr-only">Cari pengguna</label><input id="q" name="q" defaultValue={query} placeholder="Nama, email, NIM/NIP" className="rounded border border-slate-300 px-3 py-2" /></div>
            <button className="rounded border border-slate-300 px-3 py-2">Cari</button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead><tr className="border-b"><th className="p-2">Nama</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">NIM/NIP</th><th className="p-2">Prodi</th><th className="p-2">Status</th><th className="p-2">Aksi</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 align-top">
                  <td className="p-2 font-medium">{user.nama}</td><td className="p-2">{user.email}</td><td className="p-2">{user.role}</td><td className="p-2">{user.nimNip ?? "—"}</td><td className="p-2">{user.prodi?.kode ?? "—"}</td><td className="p-2"><StatusBadge status={user.status} /></td>
                  <td className="p-2"><div className="flex items-start gap-2"><Link href={`/admin/pengguna/${user.id}/edit`} className="rounded border border-slate-300 px-3 py-1.5">Edit</Link>{user.role === "ADMIN" ? <span className="rounded bg-slate-100 px-3 py-1.5 text-slate-600">Dilindungi</span> : <details><summary className="cursor-pointer rounded border border-slate-300 px-3 py-1.5">Status</summary><div className="mt-2 w-48 rounded border bg-white p-3 shadow"><p className="mb-2">Ubah status pengguna ini?</p><form action={togglePenggunaStatusAction}><input type="hidden" name="id" value={user.id} /><SubmitButton className="rounded bg-amber-600 px-3 py-1.5 text-white disabled:opacity-60">Konfirmasi</SubmitButton></form></div></details>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
