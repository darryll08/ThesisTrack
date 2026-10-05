import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusAktif } from "@prisma/client";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function KoordinatorTugasAkhirPage() {
  await requireRole("KOORDINATOR");
  const tugasAkhir = await prisma.tugasAkhir.findMany({
    include: {
      mahasiswa: { include: { prodi: { select: { kode: true, nama: true } } } },
      pengajuanTopik: { orderBy: { submittedAt: "desc" }, take: 1 },
      pembimbing: {
        where: { status: StatusAktif.ACTIVE },
        include: { dosen: { select: { nama: true } } },
        orderBy: { urutan: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 p-6 sm:p-10">
      <PageHeader eyebrow="OPERASIONAL AKADEMIK" title="Workflow Tugas Akhir" description="Tinjau pengajuan dan kelola penugasan dosen pembimbing." />
      <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-5">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead><tr className="border-b"><th className="p-2">Mahasiswa</th><th className="p-2">Prodi</th><th className="p-2">Status TA</th><th className="p-2">Pengajuan terbaru</th><th className="p-2">Status pengajuan</th><th className="p-2">Pembimbing 1</th><th className="p-2">Pembimbing 2</th><th className="p-2">Aksi</th></tr></thead>
          <tbody>
            {tugasAkhir.map((item) => {
              const latest = item.pengajuanTopik[0];
              return (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="p-2 font-medium">{item.mahasiswa.nama}<br /><span className="font-normal text-slate-500">{item.mahasiswa.nimNip}</span></td>
                  <td className="p-2">{item.mahasiswa.prodi?.kode ?? "—"}</td>
                  <td className="p-2"><StatusBadge status={item.status} /></td>
                  <td className="max-w-xs p-2">{latest?.judul ?? "—"}</td>
                  <td className="p-2">{latest ? <StatusBadge status={latest.status} /> : "—"}</td>
                  <td className="p-2">{item.pembimbing.find((p) => p.urutan === 1)?.dosen.nama ?? "—"}</td>
                  <td className="p-2">{item.pembimbing.find((p) => p.urutan === 2)?.dosen.nama ?? "—"}</td>
                  <td className="p-2"><Link href={`/koordinator/tugas-akhir/${item.id}`} className="text-blue-700">Detail</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
