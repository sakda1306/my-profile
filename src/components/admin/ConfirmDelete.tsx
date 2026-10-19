"use client";

import { useRef, useState, useTransition } from "react";
import { deleteRow } from "@/app/admin/actions/crud";
import type { ContentTable } from "@/lib/admin/storage-paths";

export function ConfirmDelete({
  table,
  id,
  label = "รายการนี้",
  onDeleted,
}: {
  table: ContentTable;
  id: string;
  label?: string;
  onDeleted?: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const res = await deleteRow(table, id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      dialog.current?.close();
      onDeleted?.();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="rounded-card border border-border px-3 py-1 text-sm text-danger"
      >
        ลบ
      </button>
      <dialog ref={dialog} className="m-auto rounded-card border border-border bg-bg p-6 text-fg">
        <p className="mb-4">ยืนยันการลบ{label}? การลบไม่สามารถย้อนกลับได้</p>
        {error ? (
          <p role="alert" className="mb-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="rounded-card border border-border px-3 py-1"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={confirm}
            className="rounded-card bg-danger px-3 py-1 text-on-accent disabled:opacity-50"
          >
            {pending ? "กำลังลบ..." : "ลบ"}
          </button>
        </div>
      </dialog>
    </>
  );
}
