"use client";

import { useActionState } from "react";
import { createProdiAction, updateProdiAction } from "@/actions/prodi";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

type ProdiFormProps = {
  prodi?: { id: string; kode: string; nama: string; status: string };
};

export function ProdiForm({ prodi }: ProdiFormProps) {
  const action = prodi ? updateProdiAction.bind(null, prodi.id) : createProdiAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const inputClass = "w-full rounded border border-slate-300 px-3 py-2";

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="kode" className="mb-1 block font-medium">Kode</label>
        <input id="kode" name="kode" required maxLength={20} defaultValue={prodi?.kode} disabled={pending} className={inputClass} />
        {state.errors?.kode?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div>
        <label htmlFor="nama" className="mb-1 block font-medium">Nama</label>
        <input id="nama" name="nama" required defaultValue={prodi?.nama} disabled={pending} className={inputClass} />
        {state.errors?.nama?.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block font-medium">Status</label>
        <select id="status" name="status" defaultValue={prodi?.status ?? "ACTIVE"} disabled={pending} className={inputClass}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      {state.message ? (
        <p role="status" className={`md:col-span-2 rounded p-3 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{state.message}</p>
      ) : null}
      <div className="md:col-span-2"><SubmitButton>{prodi ? "Simpan perubahan" : "Buat Program Studi"}</SubmitButton></div>
    </form>
  );
}
