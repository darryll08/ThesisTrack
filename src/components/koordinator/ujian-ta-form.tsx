"use client";

import { useActionState } from "react";
import { createUjianTaAction, updateUjianTaAction } from "@/actions/ujian-ta";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

type Option = { id: string; label: string };
type Schedule = {
  id: string;
  tugasAkhirId: string;
  tugasAkhirLabel: string;
  ruanganId: string;
  jenis: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
};

export function UjianTaForm({
  tugasAkhir,
  ruangan,
  schedule,
}: {
  tugasAkhir: Option[];
  ruangan: Option[];
  schedule?: Schedule;
}) {
  const action = schedule
    ? updateUjianTaAction.bind(null, schedule.id)
    : createUjianTaAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState,
  );
  const field = "w-full rounded border border-slate-300 px-3 py-2";
  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      {schedule ? (
        <div>
          <p className="font-medium">Tugas Akhir <span className="ml-2 text-xs font-normal text-slate-500">Hanya baca · tidak dapat diubah</span></p>
          <p className={`${field} mt-1 bg-slate-50 text-slate-700`}>
            {schedule.tugasAkhirLabel}
          </p>
          <input
            type="hidden"
            name="tugasAkhirId"
            value={schedule.tugasAkhirId}
          />
        </div>
      ) : (
        <label className="font-medium">
          Tugas Akhir
          <select
            name="tugasAkhirId"
            required
            disabled={pending}
            defaultValue=""
            className={`${field} mt-1`}
          >
            <option value="" disabled>
              Pilih mahasiswa
            </option>
            {tugasAkhir.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="font-medium">
        Jenis ujian
        <select
          name="jenis"
          required
          disabled={pending}
          defaultValue={schedule?.jenis ?? "SEMINAR_HASIL"}
          className={`${field} mt-1`}
        >
          <option value="SEMINAR_HASIL">Seminar Hasil</option>
          <option value="SIDANG">Sidang</option>
        </select>
      </label>
      <label className="font-medium">
        Ruangan
        <select
          name="ruanganId"
          required
          disabled={pending}
          defaultValue={schedule?.ruanganId ?? ""}
          className={`${field} mt-1`}
        >
          <option value="" disabled>
            Pilih ruangan
          </option>
          {ruangan.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="font-medium">
        Tanggal
        <input
          name="tanggal"
          type="date"
          required
          disabled={pending}
          defaultValue={schedule?.tanggal}
          className={`${field} mt-1`}
        />
      </label>
      <label className="font-medium">
        Jam mulai
        <input
          name="jamMulai"
          type="time"
          required
          disabled={pending}
          defaultValue={schedule?.jamMulai}
          className={`${field} mt-1`}
        />
      </label>
      <label className="font-medium">
        Jam selesai
        <input
          name="jamSelesai"
          type="time"
          required
          disabled={pending}
          defaultValue={schedule?.jamSelesai}
          className={`${field} mt-1`}
        />
      </label>
      {state.message ? (
        <p
          role="status"
          className={`rounded p-3 text-sm md:col-span-2 ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="md:col-span-2">
        <SubmitButton>
          {schedule ? "Simpan perubahan" : "Buat jadwal"}
        </SubmitButton>
      </div>
    </form>
  );
}
