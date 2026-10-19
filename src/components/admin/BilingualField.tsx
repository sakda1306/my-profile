"use client";

import { useState, type ReactNode } from "react";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { TranslateButton } from "@/components/admin/TranslateButton";
import { isEmptyDoc } from "@/lib/admin/doc-field";
import type { TiptapDoc } from "@/lib/richtext/texts";

type Props = {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "richtext";
  translateEnabled?: boolean;
  defaultTh?: string;
  defaultEn?: string;
  /** kind "richtext": stored docs to load into the editors (null starts empty). */
  defaultDocTh?: TiptapDoc | null;
  defaultDocEn?: TiptapDoc | null;
  /** kind "richtext": storage folder for images inserted in the editor. */
  imageFolder?: string;
  /** Optional extra content next to the translate buttons. Only shown when translateEnabled. */
  translateSlot?: ReactNode;
};

const base = "w-full rounded-xl border border-border bg-night-deep/60 px-3.5 py-2.5 text-fg transition focus:border-ember focus:outline-none focus:ring-3 focus:ring-ember/25";

function Input({
  id,
  name,
  kind,
  value,
  onChange,
}: {
  id: string;
  name: string;
  kind: "text" | "textarea";
  value: string;
  onChange: (v: string) => void;
}) {
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
      rows={4}
      className={base}
    />
  );
}

export function BilingualField(props: Props) {
  if (props.kind === "richtext") {
    return (
      <RichField
        name={props.name}
        label={props.label}
        translateEnabled={props.translateEnabled ?? false}
        defaultDocTh={props.defaultDocTh ?? null}
        defaultDocEn={props.defaultDocEn ?? null}
        imageFolder={props.imageFolder}
        translateSlot={props.translateSlot}
      />
    );
  }
  return <TextField {...props} kind={props.kind ?? "text"} />;
}

function TextField({
  name,
  label,
  kind,
  translateEnabled = false,
  defaultTh,
  defaultEn,
  translateSlot,
}: Props & { kind: "text" | "textarea" }) {
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

function docText(doc: TiptapDoc | null): string {
  // Only used for the "not empty" checks (disabled state, overwrite confirm).
  return doc && !isEmptyDoc(doc) ? "x" : "";
}

function RichField({
  name,
  label,
  translateEnabled,
  defaultDocTh,
  defaultDocEn,
  imageFolder,
  translateSlot,
}: {
  name: string;
  label: string;
  translateEnabled: boolean;
  defaultDocTh: TiptapDoc | null;
  defaultDocEn: TiptapDoc | null;
  imageFolder?: string;
  translateSlot?: ReactNode;
}) {
  const [th, setTh] = useState<TiptapDoc | null>(defaultDocTh);
  const [en, setEn] = useState<TiptapDoc | null>(defaultDocEn);
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium text-fg">{label}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 text-sm text-muted">ไทย (TH)</p>
          <TiptapEditor name={`${name}_th`} value={th} onChange={setTh} folder={imageFolder} label={`${label} (TH)`} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm text-muted">English (EN)</p>
            {translateEnabled ? (
              <span className="flex flex-wrap items-center gap-2">
                <TranslateButton
                  from="th"
                  to="en"
                  sourceValue={docText(th)}
                  targetValue={docText(en)}
                  sourceDoc={th ?? undefined}
                  onResult={() => {}}
                  onDocResult={setEn}
                />
                <TranslateButton
                  from="en"
                  to="th"
                  sourceValue={docText(en)}
                  targetValue={docText(th)}
                  sourceDoc={en ?? undefined}
                  onResult={() => {}}
                  onDocResult={setTh}
                />
                {translateSlot}
              </span>
            ) : null}
          </div>
          <TiptapEditor name={`${name}_en`} value={en} onChange={setEn} folder={imageFolder} label={`${label} (EN)`} />
        </div>
      </div>
    </fieldset>
  );
}
