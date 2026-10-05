import { PageHeader } from "@/components/ui/page-header";
import { TugasAkhirStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { calculateAnalytics } from "@/lib/phase5";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  await requireRole("KOORDINATOR");
  const items = await prisma.tugasAkhir.findMany({
    where: { status: { in: [TugasAkhirStatus.ACTIVE, TugasAkhirStatus.COMPLETED] } },
    include: { milestones: true },
  });
  const analytics = calculateAnalytics(items);
  return <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-6 sm:p-10">
    <PageHeader eyebrow="OPERASIONAL AKADEMIK" title="Analytics Tugas Akhir" description="Ringkasan status resmi dan penggunaan personal roadmap." />
    <p className="population-note">Populasi analisis <strong>{analytics.population}</strong> TA ACTIVE + COMPLETED</p>
    <section className="analytics-metrics">
      <article><p>Rata-rata Progress Roadmap</p><strong>{analytics.averageRoadmapCompletion === null ? "N/A" : analytics.averageRoadmapCompletion.toFixed(1)}{analytics.averageRoadmapCompletion === null ? null : <span>%</span>}</strong><div className="metric-meter" aria-hidden="true"><span style={{ width: `${analytics.averageRoadmapCompletion ?? 0}%` }} /></div></article>
      <article><p>Mahasiswa Selesai</p><strong>{analytics.completedPercentage.toFixed(1)}<span>%</span></strong><div className="metric-meter" aria-hidden="true"><span style={{ width: `${analytics.completedPercentage}%` }} /></div></article>
    </section>
    <section className="analytics-distribution"><div className="section-title"><p className="eyebrow">PERSONAL ROADMAP</p><h2>Penggunaan Roadmap</h2></div><div className="space-y-4"><div className="distribution-row"><div><span>TA dengan roadmap</span><strong>{analytics.withRoadmap}</strong></div></div><div className="distribution-row"><div><span>TA tanpa roadmap</span><strong>{analytics.withoutRoadmap}</strong></div></div></div></section>
  </main>;
}
