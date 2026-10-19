"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPostStatus } from "./actions";

export function PostStatusButton({ id, status }: { id: string; status: "draft" | "published" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const next = status === "published" ? "draft" : "published";

  function toggle() {
    setError(null);
    startTransition(async () => {
      const res = await setPostStatus(id, next);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="rounded-card border border-border px-3 py-1 text-sm text-fg disabled:opacity-50"
      >
        {pending ? "กำลังบันทึก..." : next === "published" ? "เผยแพร่" : "ยกเลิกการเผยแพร่"}
      </button>
      {error ? (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </span>
  );
}
