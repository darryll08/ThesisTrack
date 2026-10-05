"use client";

import { useActionState } from "react";
import { createRuanganAction, updateRuanganAction } from "@/actions/ruangan";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

type RuanganFormProps = {
  room?: { id: string; kode: string; nama: string; lokasi: string; kapasitas: number; status: string };
};

export function RuanganForm({ room }: RuanganFormProps) {
  const action = room ? updateRuanganAction.bind(null, room.id) : createRuanganAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const inputClass = "w-full rounded border border-slate-300 px-3 py-2";

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="kode" className="mb-1 block font-medium">Kode</label>
        <input id="kode" name="kode" required maxLength={30} defaultValue={room?.kode} disabled={pending} className={inputClass} />
        {state.errors?.kode?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div>
        <label htmlFor="nama" className="mb-1 block font-medium">Nama</label>
        <input id="nama" name="nama" required defaultValue={room?.nama} disabled={pending} className={inputClass} />
        {state.errors?.nama?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div>
        <label htmlFor="lokasi" className="mb-1 block font-medium">Lokasi</label>
        <input id="lokasi" name="lokasi" required defaultValue={room?.lokasi} disabled={pending} className={inputClass} />
        {state.errors?.lokasi?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div>
        <label htmlFor="kapasitas" className="mb-1 block font-medium">Kapasitas</label>
        <input id="kapasitas" name="kapasitas" type="number" min={1} step={1} required defaultValue={room?.kapasitas} disabled={pending} className={inputClass} />
        {state.errors?.kapasitas?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block font-medium">Status</label>
        <select id="status" name="status" defaultValue={room?.status ?? "ACTIVE"} disabled={pending} className={inputClass}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      {state.message ? (
        <p role="status" className={`md:col-span-2 rounded p-3 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{state.message}</p>
      ) : null}
      <div className="md:col-span-2"><SubmitButton>{room ? "Simpan perubahan" : "Buat Ruangan"}</SubmitButton></div>
    </form>
  );
}
