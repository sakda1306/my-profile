"use client";

import type { ReactNode } from "react";

type Props = {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "richtext";
  translateEnabled?: boolean;
  defaultTh?: string;
  defaultEn?: string;
  /** Slot for the TranslateButton (wired in Task 6). Only shown when translateEnabled. */
  translateSlot?: ReactNode;
};

const base = "w-full rounded-card border border-border bg-bg px-3 py-2 text-fg";

function Input({
  id,
  name,
  kind,
  defaultValue,
}: {
  id: string;
  name: string;
  kind: "text" | "textarea" | "richtext";
  defaultValue?: string;
}) {
  // richtext is a plain textarea until the Tiptap editor arrives (Task 10).
  if (kind === "text") {
    return <input id={id} name={name} defaultValue={defaultValue} className={base} />;
  }
  return (
    <textarea
      id={id}
      name={name}
      defaultValue={defaultValue}
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
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium text-fg">{label}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={`${name}_th`} className="mb-1 block text-sm text-muted">
            ไทย (TH)
          </label>
          <Input id={`${name}_th`} name={`${name}_th`} kind={kind} defaultValue={defaultTh} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor={`${name}_en`} className="text-sm text-muted">
              English (EN)
            </label>
            {translateEnabled ? translateSlot : null}
          </div>
          <Input id={`${name}_en`} name={`${name}_en`} kind={kind} defaultValue={defaultEn} />
        </div>
      </div>
    </fieldset>
  );
}
