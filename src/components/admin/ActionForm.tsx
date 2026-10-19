"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin/result";

export function ActionForm({
  action,
  children,
  submitLabel = "บันทึก",
  redirectTo,
}: {
  action: (form: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [result, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, form: FormData) => action(form),
    null,
  );
  useEffect(() => {
    if (result?.ok && redirectTo) router.push(redirectTo);
  }, [result, redirectTo, router]);

  return (
    <form action={formAction} className="space-y-4">
      {children}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-card bg-accent px-4 py-2 text-on-accent disabled:opacity-50"
        >
          {pending ? "กำลังบันทึก..." : submitLabel}
        </button>
        {result?.ok ? <p role="status">บันทึกแล้ว</p> : null}
        {result && !result.ok ? (
          <p role="alert" className="text-danger">
            {result.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
