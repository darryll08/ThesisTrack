"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { SubmitButton } from "@/components/ui/submit-button";

export function ChangePasswordForm() {
  const [state, action] = useActionState(
    changePasswordAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="password" className="mb-1 block font-medium">
          Password baru
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          autoComplete="new-password"
          required
          className="w-full rounded border border-slate-300 px-3 py-2"
        />
        {state.errors?.password?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">
            {error}
          </p>
        ))}
      </div>
      <div>
        <label htmlFor="confirmation" className="mb-1 block font-medium">
          Konfirmasi password baru
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          minLength={8}
          autoComplete="new-password"
          required
          className="w-full rounded border border-slate-300 px-3 py-2"
        />
        {state.errors?.confirmation?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">
            {error}
          </p>
        ))}
      </div>
      {state.message && !state.success ? (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </p>
      ) : null}
      <SubmitButton>Ubah password</SubmitButton>
    </form>
  );
}
