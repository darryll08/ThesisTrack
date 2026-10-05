import { PageHeader } from "@/components/ui/page-header";
import { CreatePersonalTaskForm, EditPersonalTaskForm } from "@/components/mahasiswa/personal-task-forms";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MahasiswaWorkspacePage() {
  const mahasiswa = await requireRole("MAHASISWA");
  const tasks = await prisma.personalTask.findMany({ where: { pemilikId: mahasiswa.id }, orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }] });
  return <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-6 sm:p-10">
    <PageHeader eyebrow="AKADEMIK" title="Workspace" description="Kelola tugas akademik dan personal." />
    <section className="editorial-section"><h2 className="mb-4 text-lg font-semibold">Tambah task</h2><CreatePersonalTaskForm /></section>
    <section className="editorial-section"><h2 className="mb-4 text-lg font-semibold">Task saya</h2>{tasks.length ? <div className="space-y-4">{tasks.map((item) => <EditPersonalTaskForm key={item.id} task={{ id: item.id, nama: item.nama, tipe: item.tipe, status: item.status, dueDate: item.dueDate?.toISOString().slice(0, 10) ?? "" }} />)}</div> : <p className="text-slate-600">Belum ada task.</p>}</section>
  </main>;
}
