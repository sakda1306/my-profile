"use client";

import { useState, useTransition } from "react";
import { translateAction } from "@/app/admin/actions/translate";
import type { Locale } from "@/lib/locale/pick";

type Props = {
  from: Locale;
  to: Locale;
  sourceValue: string;
  targetValue: string;
  /** Receives the translated text. The caller fills the field; nothing is saved here. */
  onResult: (text: string) => void;
};

const LABEL: Record<Locale, string> = { th: "TH", en: "EN" };

export function TranslateButton({ from, to, sourceValue, targetValue, onResult }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    if (targetValue.trim() && !confirm("ช่องปลายทางมีข้อความอยู่แล้ว เขียนทับไหม?")) return;
    startTransition(async () => {
      const res = await translateAction({ kind: "text", text: sourceValue }, from, to);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onResult(res.data?.text ?? "");
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={pending || !sourceValue.trim()}
        className="rounded-card border border-border bg-bg px-2 py-1 text-xs text-fg disabled:opacity-50"
      >
        {pending ? "กำลังแปล..." : `${LABEL[from]} → ${LABEL[to]}`}
      </button>
      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </span>
  );
}
