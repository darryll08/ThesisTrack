"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm() {
  const [state, action, pending] = useActionState(
    loginAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1 block font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="w-full rounded border border-slate-300 px-3 py-2"
        />
        {state.errors?.email?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">
            {error}
          </p>
        ))}
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="w-full rounded border border-slate-300 px-3 py-2"
        />
        {state.errors?.password?.map((error) => (
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
      <SubmitButton pendingLabel="Masuk..." className="w-full rounded bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60">
        Masuk
      </SubmitButton>
    </form>
  );
}
