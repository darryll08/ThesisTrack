"use client";

import { useActionState } from "react";
import { createPengajuanTopikAction } from "@/actions/pengajuan-topik";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

export function PengajuanTopikForm({ tugasAkhirId }: { tugasAkhirId: string }) {
  const [state, action, pending] = useActionState(
    createPengajuanTopikAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="tugasAkhirId" value={tugasAkhirId} />
      <div>
        <label htmlFor="judul" className="mb-1 block font-medium">
          Judul usulan
        </label>
        <textarea
          id="judul"
          name="judul"
          required
          maxLength={1000}
          disabled={pending}
          className="min-h-24 w-full rounded border border-slate-300 px-3 py-2"
        />
        {state.errors?.judul?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">
            {error}
          </p>
        ))}
      </div>
      <div>
        <label htmlFor="bidang" className="mb-1 block font-medium">
          Bidang (opsional)
        </label>
        <input
          id="bidang"
          name="bidang"
          maxLength={255}
          disabled={pending}
          className="w-full rounded border border-slate-300 px-3 py-2"
        />
        {state.errors?.bidang?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">
            {error}
          </p>
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
      <SubmitButton pendingLabel="Mengirim...">Ajukan topik</SubmitButton>
    </form>
  );
}
