"use client";

import { useActionState } from "react";
import { reviewPengajuanTopikAction } from "@/actions/review-topik";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

export function ReviewPengajuanForm({ pengajuanId }: { pengajuanId: string }) {
  const [state, action, pending] = useActionState(
    reviewPengajuanTopikAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="pengajuanId" value={pengajuanId} />
      <div>
        <label htmlFor="keputusan" className="mb-1 block font-medium">
          Keputusan
        </label>
        <select
          id="keputusan"
          name="keputusan"
          required
          disabled={pending}
          className="w-full rounded border border-slate-300 px-3 py-2"
        >
          <option value="DISETUJUI">Setujui</option>
          <option value="PERLU_REVISI">Perlu revisi</option>
        </select>
        {state.errors?.keputusan?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">{error}</p>
        ))}
      </div>
      <div>
        <label htmlFor="catatan" className="mb-1 block font-medium">
          Catatan
        </label>
        <textarea
          id="catatan"
          name="catatan"
          maxLength={4000}
          disabled={pending}
          className="min-h-24 w-full rounded border border-slate-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-slate-500">
          Wajib diisi untuk keputusan perlu revisi.
        </p>
        {state.errors?.catatan?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">{error}</p>
        ))}
      </div>
      {state.message ? (
        <p
          role="status"
          className={`rounded p-3 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Memproses...">Simpan keputusan</SubmitButton>
    </form>
  );
}
