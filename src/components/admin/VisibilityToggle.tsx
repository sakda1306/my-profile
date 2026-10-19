"use client";

import { useState, useTransition } from "react";
import { setVisible } from "@/app/admin/actions/crud";
import type { ContentTable } from "@/lib/admin/storage-paths";

export function VisibilityToggle({
  table,
  id,
  visible: initial,
}: {
  table: ContentTable;
  id: string;
  visible: boolean;
}) {
  const [visible, setVis] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !visible;
    setVis(next);
    setError(null);
    startTransition(async () => {
      const res = await setVisible(table, id, next);
      if (!res.ok) {
        setVis(!next);
        setError(res.error);
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        disabled={pending}
        onClick={toggle}
        className="rounded-full border border-border px-3.5 py-1 transition hover:bg-ghost text-sm text-fg disabled:opacity-50"
      >
        {visible ? "แสดง" : "ซ่อน"}
      </button>
      {error ? (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </span>
  );
}
