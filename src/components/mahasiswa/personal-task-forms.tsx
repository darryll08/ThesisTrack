"use client";

import { useActionState, useId } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  createPersonalTaskAction,
  deletePersonalTaskAction,
  updatePersonalTaskAction,
} from "@/actions/personal-task";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-state";

type Task = { id: string; nama: string; tipe: string; status: string; dueDate: string };
const types = ["THESIS", "STUDY", "PERSONAL"];
const statuses = ["TODO", "IN_PROGRESS", "SELESAI"];

function Fields({ task }: { task?: Task }) {
  const id = useId();
  const inputClass = "w-full rounded border border-slate-300 px-3 py-2";
  return <>
    <div><label htmlFor={id + "-nama"} className="mb-1 block font-medium">Nama</label><input id={id + "-nama"} name="nama" required maxLength={255} defaultValue={task?.nama} className={inputClass} /></div>
    <div><label htmlFor={id + "-tipe"} className="mb-1 block font-medium">Tipe</label><select id={id + "-tipe"} name="tipe" defaultValue={task?.tipe ?? "THESIS"} className={inputClass}>{types.map((item) => <option key={item}>{item}</option>)}</select></div>
    <div><label htmlFor={id + "-due"} className="mb-1 block font-medium">Jatuh tempo</label><input id={id + "-due"} name="dueDate" type="date" defaultValue={task?.dueDate} className={inputClass} /></div>
    <div><label htmlFor={id + "-status"} className="mb-1 block font-medium">Status</label><select id={id + "-status"} name="status" defaultValue={task?.status ?? "TODO"} className={inputClass}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
  </>;
}

export function CreatePersonalTaskForm() {
  const [state, action] = useActionState(createPersonalTaskAction, initialActionState);
  return <form action={action} className="grid gap-4 md:grid-cols-2"><Fields />{state.message ? <p role="status" className={`rounded p-3 text-sm md:col-span-2 ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{state.message}</p> : null}<div className="md:col-span-2"><SubmitButton pendingLabel="Membuat...">Tambah task</SubmitButton></div></form>;
}

export function EditPersonalTaskForm({ task }: { task: Task }) {
  const [state, action] = useActionState(updatePersonalTaskAction.bind(null, task.id), initialActionState);
  const [deleteState, deleteAction] = useActionState(deletePersonalTaskAction.bind(null, task.id), initialActionState);
  return <details className="workspace-task"><summary><span>{task.nama}<small>{task.tipe}{task.dueDate ? ` · ${task.dueDate}` : ""} · Buka untuk mengedit</small></span><StatusBadge status={task.status} /></summary><form action={action} className="grid gap-3 md:grid-cols-2"><Fields task={task} />{state.message ? <p role="status" className={`rounded p-2 text-sm md:col-span-2 ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{state.message}</p> : null}<div className="md:col-span-2"><SubmitButton pendingLabel="Menyimpan...">Simpan perubahan</SubmitButton></div></form><form action={deleteAction} className="mt-3">{deleteState.message ? <p className="mb-2 text-sm text-red-700">{deleteState.message}</p> : null}<SubmitButton pendingLabel="Menghapus..." className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-60">Hapus task</SubmitButton></form></details>;
}
