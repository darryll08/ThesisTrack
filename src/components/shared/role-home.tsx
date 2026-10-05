import Link from "next/link";
import type { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
type User = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
export function RoleHome({ title, user, links = [] }: { title: string; user: User; links?: { href: string; label: string }[] }) {
  return <main><PageHeader eyebrow="OPERASIONAL AKADEMIK" title={title} description={`Selamat datang, ${user.nama}. Kelola perjalanan akademik dengan pandangan yang utuh.`}/><div className="dashboard-split">{links.map((link,index) => <section className="editorial-section" key={link.href}><p className="eyebrow">0{index+1} / AKADEMIK</p><h2>{link.label}</h2><p className="text-slate-500 mb-5">{index===0 ? "Tinjau pengajuan dan penetapan pembimbing mahasiswa." : index===1 ? "Atur waktu dan ruang untuk agenda ujian akademik." : index===2 ? "Pantau perkembangan, aktivitas terakhir, dan risiko keterlambatan." : "Baca progres keseluruhan dan distribusi tahapan tugas akhir."}</p><Link className="action-link" href={link.href}>Buka {link.label.toLowerCase()} ↗</Link></section>)}</div></main>;
}
