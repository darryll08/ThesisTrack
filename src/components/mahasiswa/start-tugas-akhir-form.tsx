"use client";

import { useActionState } from "react";
import { startTugasAkhirAction } from "@/actions/tugas-akhir";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

export function StartTugasAkhirForm() {
  const [state, action] = useActionState(
    startTugasAkhirAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <p
          role="status"
          className={`rounded p-3 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Memulai...">Mulai proses tugas akhir</SubmitButton>
    </form>
  );
}
