"use client";

import { useActionState } from "react";
import {
  createPenggunaAction,
  updatePenggunaAction,
} from "@/actions/pengguna";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

type PenggunaFormProps = {
  user?: {
    id: string;
    nama: string;
    email: string;
    role: string;
    nimNip: string | null;
    prodiId: string | null;
    status: string;
  };
  prodis: { id: string; kode: string; nama: string }[];
};

function Errors({ errors }: { errors?: string[] }) {
  return errors?.map((error) => (
    <p key={error} className="mt-1 text-sm text-red-700">
      {error}
    </p>
  ));
}

export function PenggunaForm({ user, prodis }: PenggunaFormProps) {
  const action = user
    ? updatePenggunaAction.bind(null, user.id)
    : createPenggunaAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState,
  );
  const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
  const protectedAdmin = user?.role === "ADMIN";

  return (
    <form action={formAction} autoComplete={user ? "on" : "off"} className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="nama" className="mb-1 block font-medium">Nama</label>
        <input id="nama" name="nama" required defaultValue={user?.nama} disabled={pending} className={inputClass} />
        <Errors errors={state.errors?.nama} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete={user ? "email" : "off"} required defaultValue={user?.email} disabled={pending} className={inputClass} />
        <Errors errors={state.errors?.email} />
      </div>
      <div>
        <label htmlFor="role" className="mb-1 block font-medium">Role</label>
        {protectedAdmin ? <input type="hidden" name="role" value="ADMIN" /> : null}
        <select id="role" name={protectedAdmin ? undefined : "role"} defaultValue={user?.role ?? "MAHASISWA"} disabled={pending || protectedAdmin} className={inputClass}>
          <option value="MAHASISWA">Mahasiswa</option>
          <option value="DOSEN">Dosen</option>
          <option value="KOORDINATOR">Koordinator</option>
          <option value="ADMIN">Admin</option>
        </select>
        <Errors errors={state.errors?.role} />
      </div>
      <div>
        <label htmlFor="nimNip" className="mb-1 block font-medium">NIM/NIP</label>
        <input id="nimNip" name="nimNip" defaultValue={user?.nimNip ?? ""} disabled={pending} className={inputClass} />
        <Errors errors={state.errors?.nimNip} />
      </div>
      <div>
        <label htmlFor="prodiId" className="mb-1 block font-medium">Program Studi</label>
        <select id="prodiId" name="prodiId" defaultValue={user?.prodiId ?? ""} disabled={pending} className={inputClass}>
          <option value="">Tanpa Program Studi</option>
          {prodis.map((prodi) => (
            <option key={prodi.id} value={prodi.id}>{prodi.kode} — {prodi.nama}</option>
          ))}
        </select>
        <Errors errors={state.errors?.prodiId} />
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block font-medium">Status</label>
        {protectedAdmin ? <input type="hidden" name="status" value="ACTIVE" /> : null}
        <select id="status" name={protectedAdmin ? undefined : "status"} defaultValue={user?.status ?? "ACTIVE"} disabled={pending || protectedAdmin} className={inputClass}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <Errors errors={state.errors?.status} />
      </div>
      {!user ? (
        <div className="md:col-span-2">
          <label htmlFor="password" className="mb-1 block font-medium">Temporary password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={pending} className={inputClass} />
          <Errors errors={state.errors?.password} />
        </div>
      ) : null}
      {state.message ? (
        <p role="status" className={`md:col-span-2 rounded p-3 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {state.message}
        </p>
      ) : null}
      <div className="md:col-span-2">
        <SubmitButton>{user ? "Simpan perubahan" : "Buat pengguna"}</SubmitButton>
      </div>
    </form>
  );
}
