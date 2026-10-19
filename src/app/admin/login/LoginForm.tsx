"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/admin/result";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null,
  );
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        อีเมล
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        รหัสผ่าน
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>
      {state && !state.ok ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-accent px-6 py-2.5 font-semibold text-on-accent shadow-[0_8px_24px_rgb(255_138_43/0.25)] transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
