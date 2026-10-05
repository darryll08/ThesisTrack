"use client";

import { useActionState } from "react";
import { createBimbinganAction } from "@/actions/bimbingan";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

type Option = { id: string; label: string };

export function BimbinganForm({
  tugasAkhirId,
  pembimbing,
  milestones,
  documents,
}: {
  tugasAkhirId: string;
  pembimbing: Option[];
  milestones: Option[];
  documents: Option[];
}) {
  const [state, action, pending] = useActionState(
    createBimbinganAction,
    initialActionState,
  );
  const inputClass = "w-full rounded border border-slate-300 px-3 py-2";

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="tugasAkhirId" value={tugasAkhirId} />
      <div>
        <label htmlFor="pembimbingId" className="mb-1 block font-medium">Pembimbing</label>
        <select id="pembimbingId" name="pembimbingId" required disabled={pending} className={inputClass}><option value="">Pilih pembimbing</option>{pembimbing.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        {state.errors?.pembimbingId?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div>
        <label htmlFor="taMilestoneId" className="mb-1 block font-medium">Item roadmap (opsional)</label>
        <select id="taMilestoneId" name="taMilestoneId" disabled={pending} className={inputClass}><option value="">Tanpa item roadmap</option>{milestones.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        {state.errors?.taMilestoneId?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div>
        <label htmlFor="tanggal" className="mb-1 block font-medium">Tanggal</label>
        <input id="tanggal" name="tanggal" type="date" required disabled={pending} className={inputClass} />
        {state.errors?.tanggal?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div>
        <label htmlFor="dokumenId" className="mb-1 block font-medium">Dokumen (opsional)</label>
        <select id="dokumenId" name="dokumenId" disabled={pending} className={inputClass}><option value="">Tanpa dokumen</option>{documents.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        {state.errors?.dokumenId?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div className="md:col-span-2">
        <label htmlFor="topik" className="mb-1 block font-medium">Topik</label>
        <textarea id="topik" name="topik" required maxLength={4000} disabled={pending} className="min-h-24 w-full rounded border border-slate-300 px-3 py-2" />
        {state.errors?.topik?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      {state.message ? <p role="status" className={`rounded p-3 text-sm md:col-span-2 ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{state.message}</p> : null}
      <div className="md:col-span-2"><SubmitButton pendingLabel="Mengirim...">Kirim permintaan bimbingan</SubmitButton></div>
    </form>
  );
}
