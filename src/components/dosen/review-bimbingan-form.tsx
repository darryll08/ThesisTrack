"use client";

import { useActionState } from "react";
import { reviewBimbinganAction } from "@/actions/bimbingan";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

export function ReviewBimbinganForm({ bimbinganId }: { bimbinganId: string }) {
  const [state, action, pending] = useActionState(reviewBimbinganAction, initialActionState);
  const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
  return (
    <form action={action} className="mt-4 space-y-3 border-t border-slate-200 pt-4">
      <input type="hidden" name="bimbinganId" value={bimbinganId} />
      <div><label htmlFor={`keputusan-${bimbinganId}`} className="mb-1 block font-medium">Keputusan</label><select id={`keputusan-${bimbinganId}`} name="keputusan" disabled={pending} className={inputClass}><option value="TERVALIDASI">Tervalidasi</option><option value="PERLU_REVISI">Perlu revisi</option></select></div>
      <div><label htmlFor={`feedback-${bimbinganId}`} className="mb-1 block font-medium">Feedback (opsional)</label><textarea id={`feedback-${bimbinganId}`} name="feedback" maxLength={4000} disabled={pending} className={inputClass} /></div>
      <div><label htmlFor={`revision-${bimbinganId}`} className="mb-1 block font-medium">Revision item</label><textarea id={`revision-${bimbinganId}`} name="revisionItem" maxLength={4000} disabled={pending} className={inputClass} /><p className="mt-1 text-xs text-slate-500">Wajib untuk keputusan perlu revisi; diabaikan untuk tervalidasi.</p>{state.errors?.revisionItem?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}</div>
      {state.message ? <p role="status" className={`rounded p-3 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{state.message}</p> : null}
      <SubmitButton pendingLabel="Memproses...">Simpan review</SubmitButton>
    </form>
  );
}
