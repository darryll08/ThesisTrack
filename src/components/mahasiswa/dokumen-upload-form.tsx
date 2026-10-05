"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { finalizeDokumenUploadAction } from "@/actions/dokumen";
import {
  buildDocumentPath,
  MAX_PDF_SIZE_BYTES,
} from "@/lib/dokumen";

export function DokumenUploadForm({ tugasAkhirId }: { tugasAkhirId: string }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = fileInput.current?.files?.[0];
    const jenisValue = new FormData(form).get("jenis");
    const jenis = typeof jenisValue === "string" ? jenisValue.trim() : "";

    if (!file || !jenis) {
      setSuccess(false);
      setMessage("Pilih file PDF dan isi nama atau jenis dokumen.");
      return;
    }
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setSuccess(false);
      setMessage("File harus berupa PDF.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_PDF_SIZE_BYTES) {
      setSuccess(false);
      setMessage("Ukuran file harus lebih dari 0 dan maksimal 20 MB.");
      return;
    }

    setMessage("");
    setProgress(0);
    startTransition(() => {
      void (async () => {
        try {
          const blob = await upload(
            buildDocumentPath(tugasAkhirId, file.name),
            file,
            {
              access: "private",
              handleUploadUrl: "/api/blob/dokumen/upload",
              clientPayload: JSON.stringify({ tugasAkhirId }),
              contentType: "application/pdf",
              onUploadProgress: ({ percentage }) => setProgress(percentage),
            },
          );
          const state = await finalizeDokumenUploadAction({
            tugasAkhirId,
            jenis,
            namaFile: file.name,
            storagePath: blob.pathname,
          });
          setSuccess(state.success);
          setMessage(state.message);
          if (state.success) {
            form.reset();
            setProgress(100);
            router.refresh();
          }
        } catch {
          setSuccess(false);
          setMessage("Upload gagal. Periksa konfigurasi penyimpanan dan coba lagi.");
        }
      })();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="jenis" className="mb-1 block font-medium">Nama / jenis dokumen</label>
        <input id="jenis" name="jenis" type="text" placeholder="Tulis nama dokumen..." required maxLength={255} disabled={pending} className="w-full rounded border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="file" className="mb-1 block font-medium">File PDF</label>
        <input ref={fileInput} id="file" name="file" type="file" accept="application/pdf,.pdf" required disabled={pending} className="block w-full rounded border border-slate-300 px-3 py-2" />
        <p className="mt-1 text-xs text-slate-500">Maksimal 20 MB. Setiap upload membuat versi baru.</p>
      </div>
      {pending ? <p className="text-sm text-slate-600">Upload {Math.round(progress)}%</p> : null}
      {message ? <p role="status" className={`rounded p-3 text-sm ${success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{message}</p> : null}
      <button type="submit" disabled={pending} className="rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-60">{pending ? "Mengunggah..." : "Upload dokumen"}</button>
    </form>
  );
}
