"use client";

import { useActionState } from "react";
import { assignPembimbingAction } from "@/actions/pembimbing";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

type Dosen = { id: string; nama: string; nimNip: string | null };

export function AssignPembimbingForm({
  tugasAkhirId,
  dosen,
  defaults,
}: {
  tugasAkhirId: string;
  dosen: Dosen[];
  defaults: { satu?: string; dua?: string };
}) {
  const [state, action, pending] = useActionState(
    assignPembimbingAction,
    initialActionState,
  );
  const inputClass = "w-full rounded border border-slate-300 px-3 py-2";

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="tugasAkhirId" value={tugasAkhirId} />
      <div>
        <label htmlFor="pembimbingSatuId" className="mb-1 block font-medium">
          Pembimbing 1
        </label>
        <select
          id="pembimbingSatuId"
          name="pembimbingSatuId"
          required
          defaultValue={defaults.satu ?? ""}
          disabled={pending}
          className={inputClass}
        >
          <option value="">Pilih Dosen</option>
          {dosen.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama} {item.nimNip ? `— ${item.nimNip}` : ""}
            </option>
          ))}
        </select>
        {state.errors?.pembimbingSatuId?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">{error}</p>
        ))}
      </div>
      <div>
        <label htmlFor="pembimbingDuaId" className="mb-1 block font-medium">
          Pembimbing 2
        </label>
        <select
          id="pembimbingDuaId"
          name="pembimbingDuaId"
          required
          defaultValue={defaults.dua ?? ""}
          disabled={pending}
          className={inputClass}
        >
          <option value="">Pilih Dosen</option>
          {dosen.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama} {item.nimNip ? `— ${item.nimNip}` : ""}
            </option>
          ))}
        </select>
        {state.errors?.pembimbingDuaId?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">{error}</p>
        ))}
      </div>
      {state.message ? (
        <p
          role="status"
          className={`rounded p-3 text-sm md:col-span-2 ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="md:col-span-2">
        <SubmitButton pendingLabel="Menetapkan...">Tetapkan pembimbing</SubmitButton>
      </div>
    </form>
  );
}
