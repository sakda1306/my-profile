"use client";

import { useState, type ReactNode } from "react";
import { TranslateButton } from "@/components/admin/TranslateButton";

type Props = {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "richtext";
  translateEnabled?: boolean;
  defaultTh?: string;
  defaultEn?: string;
  /** Optional extra content next to the translate buttons. Only shown when translateEnabled. */
  translateSlot?: ReactNode;
};

const base = "w-full rounded-card border border-border bg-bg px-3 py-2 text-fg";

function Input({
  id,
  name,
  kind,
  value,
  onChange,
}: {
  id: string;
  name: string;
  kind: "text" | "textarea" | "richtext";
  value: string;
  onChange: (v: string) => void;
}) {
  // richtext is a plain textarea until the Tiptap editor arrives (Task 10).
  if (kind === "text") {
    return <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />;
  }
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={kind === "richtext" ? 10 : 4}
      className={base}
    />
  );
}

export function BilingualField({
  name,
  label,
  kind = "text",
  translateEnabled = false,
  defaultTh,
  defaultEn,
  translateSlot,
}: Props) {
  const [th, setTh] = useState(defaultTh ?? "");
  const [en, setEn] = useState(defaultEn ?? "");
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium text-fg">{label}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={`${name}_th`} className="mb-1 block text-sm text-muted">
            ไทย (TH)
          </label>
          <Input id={`${name}_th`} name={`${name}_th`} kind={kind} value={th} onChange={setTh} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor={`${name}_en`} className="text-sm text-muted">
              English (EN)
            </label>
            {translateEnabled ? (
              <span className="flex flex-wrap items-center gap-2">
                <TranslateButton from="th" to="en" sourceValue={th} targetValue={en} onResult={setEn} />
                <TranslateButton from="en" to="th" sourceValue={en} targetValue={th} onResult={setTh} />
                {translateSlot}
              </span>
            ) : null}
          </div>
          <Input id={`${name}_en`} name={`${name}_en`} kind={kind} value={en} onChange={setEn} />
        </div>
      </div>
    </fieldset>
  );
}
