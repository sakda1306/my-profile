"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CREATABLE_TYPES, TYPE_LABEL, isCreatableType } from "@/lib/admin/schemas";
import { createSection } from "./actions";

const input = "w-full rounded-card border border-border bg-bg px-3 py-2 text-fg";

export function AddSectionForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const type = String(data.get("type") ?? "");
    if (!isCreatableType(type)) {
      setError("ประเภทหมวดไม่ถูกต้อง");
      return;
    }
    setError(null);
    start(async () => {
      const res = await createSection(type, {
        th: String(data.get("title_th") ?? ""),
        en: String(data.get("title_en") ?? ""),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      form.reset();
      if (res.data) router.push(`/admin/sections/${res.data.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm text-muted">ประเภท</span>
        <select name="type" defaultValue="rich_text" className={input}>
          {CREATABLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">ชื่อหมวด ไทย (TH)</span>
          <input name="title_th" maxLength={120} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">ชื่อหมวด English (EN)</span>
          <input name="title_en" maxLength={120} className={input} />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-card bg-accent px-4 py-2 text-on-accent disabled:opacity-50"
        >
          {pending ? "กำลังเพิ่ม..." : "เพิ่มหมวด"}
        </button>
        {error ? (
          <p role="alert" className="text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
