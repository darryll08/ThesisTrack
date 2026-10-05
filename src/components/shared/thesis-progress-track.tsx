import type { TaMilestoneStatus } from "@prisma/client";
import { deriveRoadmap } from "@/lib/phase5";

type Milestone = { id?: string; status: TaMilestoneStatus; nama: string; urutan: number };
export function ThesisProgressTrack({ milestones }: { milestones: Milestone[] }) {
  const ordered = [...milestones].sort((a, b) => a.urutan - b.urutan);
  const progress = deriveRoadmap(milestones);
  const current = ordered.findIndex((item) => item.status === "BELUM");
  return <section className="thesis-track" aria-label="Progress Roadmap"><div className="track-heading"><div><p className="eyebrow">PROGRESS ROADMAP</p><h2>Roadmap Saya</h2></div><p className="track-percent">{progress.percentage === null ? "N/A" : Math.round(progress.percentage)}{progress.percentage === null ? null : <span>%</span>}</p></div>{!ordered.length ? <p role="status" className="empty-note">Belum ada roadmap.</p> : <ol>{ordered.map((item, index) => {
    const done = item.status === "SELESAI";
    return <li key={item.id ?? item.urutan} className={done ? "done" : index === current ? "current" : "future"} aria-current={index === current ? "step" : undefined}><span className="track-node">{done ? "✓" : String(index + 1).padStart(2, "0")}</span><div><p>{item.nama}</p><small>{done ? "Selesai" : index === current ? "Item berikutnya" : "Direncanakan"}</small></div></li>;
  })}</ol>}</section>;
}
