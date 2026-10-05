"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import {
  createRoadmapItemAction,
  deleteRoadmapItemAction,
  moveRoadmapItemAction,
  renameRoadmapItemAction,
  toggleRoadmapItemAction,
} from "@/actions/roadmap";
import { ThesisProgressTrack } from "@/components/shared/thesis-progress-track";
import { initialActionState } from "@/lib/action-state";

type RoadmapItem = { id: string; nama: string; urutan: number; status: "BELUM" | "SELESAI" };

function DraftRow({ tugasAkhirId, autoFocus, onRemove }: { tugasAkhirId: string; autoFocus: boolean; onRemove: () => void }) {
  const [state, action, pending] = useActionState(createRoadmapItemAction, initialActionState);
  if (state.success) return null;
  return <form action={action} className="roadmap-draft-row">
    <input type="hidden" name="tugasAkhirId" value={tugasAkhirId} />
    <input name="nama" maxLength={255} placeholder="Nama item roadmap" aria-label="Nama item roadmap" autoFocus={autoFocus} disabled={pending} required />
    <button type="submit" disabled={pending}>Simpan</button>
    <button type="button" onClick={onRemove} disabled={pending} aria-label="Hapus baris kosong"><Trash2 size={14} /></button>
    {state.message ? <small role="status">{state.message}</small> : null}
  </form>;
}

function ItemRow({ item, first, last }: { item: RoadmapItem; first: boolean; last: boolean }) {
  const [renameState, rename, renaming] = useActionState(renameRoadmapItemAction, initialActionState);
  const [, toggle, toggling] = useActionState(toggleRoadmapItemAction, initialActionState);
  const [, move, moving] = useActionState(moveRoadmapItemAction, initialActionState);
  const [, remove, removing] = useActionState(deleteRoadmapItemAction, initialActionState);
  const pending = renaming || toggling || moving || removing;
  return <li className={item.status === "SELESAI" ? "roadmap-item is-checked" : "roadmap-item"}>
    <form action={toggle}>
      <input type="hidden" name="itemId" value={item.id} />
      <button className="roadmap-check" type="submit" disabled={pending} aria-label={item.status === "SELESAI" ? `Batalkan checklist ${item.nama}` : `Tandai ${item.nama} selesai`}>{item.status === "SELESAI" ? "✓" : ""}</button>
    </form>
    <form action={rename} className="roadmap-name-form">
      <input type="hidden" name="itemId" value={item.id} />
      <input name="nama" defaultValue={item.nama} maxLength={255} disabled={pending} aria-label={`Nama item ${item.urutan}`} required />
      <button type="submit" disabled={pending}>Simpan</button>
      {renameState.message && !renameState.success ? <small role="status">{renameState.message}</small> : null}
    </form>
    <div className="roadmap-actions">
      <form action={move}><input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="direction" value="UP" /><button type="submit" disabled={pending || first} aria-label={`Naikkan ${item.nama}`}><ChevronUp size={15} /></button></form>
      <form action={move}><input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="direction" value="DOWN" /><button type="submit" disabled={pending || last} aria-label={`Turunkan ${item.nama}`}><ChevronDown size={15} /></button></form>
      <form action={remove} onSubmit={(event) => { if (!window.confirm(`Hapus "${item.nama}" dari roadmap?`)) event.preventDefault(); }}><input type="hidden" name="itemId" value={item.id} /><button type="submit" disabled={pending} aria-label={`Hapus ${item.nama}`}><Trash2 size={14} /></button></form>
    </div>
  </li>;
}

export function RoadmapManager({ tugasAkhirId, items, editable }: { tugasAkhirId: string; items: RoadmapItem[]; editable: boolean }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftRows, setDraftRows] = useState<number[]>([]);
  const openEditor = (count: number) => {
    setDraftRows(Array.from({ length: count }, (_, index) => index + 1));
    setEditorOpen(true);
  };
  const addDraft = () => {
    setDraftRows((current) => [...current, (current.at(-1) ?? 0) + 1]);
    setEditorOpen(true);
  };
  const removeDraft = (id: number) => {
    if (draftRows.length === 1 && items.length === 0) setEditorOpen(false);
    setDraftRows((current) => current.filter((draftId) => draftId !== id));
  };
  return <section className="space-y-5">
    <ThesisProgressTrack milestones={items} />
    {editable ? <div className="roadmap-editor">
      <div className="section-title"><p className="eyebrow">PERSONAL ROADMAP</p><h2>Kelola Roadmap Saya</h2><p>Checklist pribadi ini fleksibel dan bukan persentase resmi penyelesaian tugas akhir.</p></div>
      {items.length ? <ol className="roadmap-list">{items.map((item, index) => <ItemRow key={item.id} item={item} first={index === 0} last={index === items.length - 1} />)}</ol> : !editorOpen ? <div className="roadmap-empty"><strong>Belum ada roadmap</strong><p>Mulai kosong atau siapkan tujuh baris kosong sebagai panduan. Baris belum disimpan ke database.</p><div><button type="button" onClick={() => openEditor(7)}>Gunakan Panduan</button><button type="button" onClick={() => openEditor(1)}>Mulai Kosong</button></div></div> : null}
      {draftRows.map((id, index) => <DraftRow key={id} tugasAkhirId={tugasAkhirId} autoFocus={index === 0} onRemove={() => removeDraft(id)} />)}
      {(items.length || editorOpen) ? <button type="button" className="roadmap-add" onClick={addDraft}><Plus size={15} /> Tambah item</button> : null}
    </div> : <p className="empty-note">Roadmap read-only karena tugas akhir sudah selesai atau dibatalkan.</p>}
  </section>;
}
