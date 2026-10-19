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
      <label className="flex flex-col gap-1">
        อีเมล
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border border-current/30 rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        รหัสผ่าน
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="border border-current/30 rounded px-3 py-2"
        />
      </label>
      {state && !state.ok ? (
        <p role="alert" className="text-sm">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="border border-current rounded px-3 py-2"
      >
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
