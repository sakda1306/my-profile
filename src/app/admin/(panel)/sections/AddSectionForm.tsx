"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CREATABLE_TYPES, TYPE_LABEL, isCreatableType } from "@/lib/admin/schemas";
import { createSection } from "./actions";

const input = "w-full rounded-xl border border-border bg-night-deep/60 px-3.5 py-2.5 text-fg transition focus:border-ember focus:outline-none focus:ring-3 focus:ring-ember/25";

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
          className="rounded-full bg-accent px-6 py-2.5 font-semibold text-on-accent shadow-[0_8px_24px_rgb(255_138_43/0.25)] transition hover:brightness-110 disabled:opacity-50"
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
