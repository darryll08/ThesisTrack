"use client";

import { useActionState } from "react";
import { completeTugasAkhirAction } from "@/actions/tugas-akhir";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

export function CompleteTugasAkhirForm({ tugasAkhirId }: { tugasAkhirId: string }) {
  const [state, action] = useActionState(completeTugasAkhirAction, initialActionState);
  return <form action={action} onSubmit={(event) => { if (!window.confirm("Tandai tugas akhir ini selesai? Status COMPLETED akan mengunci perubahan mahasiswa.")) event.preventDefault(); }}>
    <input type="hidden" name="tugasAkhirId" value={tugasAkhirId} />
    <SubmitButton pendingLabel="Menyimpan...">Tandai Tugas Akhir Selesai</SubmitButton>
    {state.message ? <p role="status" className={`mt-3 text-sm ${state.success ? "text-green-700" : "text-red-700"}`}>{state.message}</p> : null}
  </form>;
}
