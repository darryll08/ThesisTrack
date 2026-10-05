"use client";

import { useActionState } from "react";
import { createTindakLanjutAction } from "@/actions/tindak-lanjut";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

export function TindakLanjutForm({ tugasAkhirId }: { tugasAkhirId: string }) {
  const [state, action, pending] = useActionState(createTindakLanjutAction, initialActionState);
  return <form action={action} className="space-y-3"><input type="hidden" name="tugasAkhirId" value={tugasAkhirId} /><div><label htmlFor="catatan" className="mb-1 block font-medium">Catatan tindak lanjut</label><textarea id="catatan" name="catatan" required maxLength={4000} disabled={pending} className="min-h-24 w-full rounded border border-slate-300 px-3 py-2" />{state.errors?.catatan?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}</div>{state.message ? <p role="status" className={`rounded p-3 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{state.message}</p> : null}<SubmitButton pendingLabel="Menambahkan...">Tambah tindak lanjut</SubmitButton></form>;
}
