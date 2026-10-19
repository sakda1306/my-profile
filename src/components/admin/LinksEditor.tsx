"use client";

import { useState } from "react";

export type LinkRow = { label: string; url: string; icon: string };
const MAX = 10;
const input = "w-full rounded-xl border border-border bg-night-deep/60 px-3.5 py-2.5 text-fg transition focus:border-ember focus:outline-none focus:ring-3 focus:ring-ember/25";

export function LinksEditor({ name, defaultValue }: { name: string; defaultValue: LinkRow[] }) {
  const [rows, setRows] = useState<LinkRow[]>(defaultValue);
  const set = (i: number, patch: Partial<LinkRow>) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium text-fg">ลิงก์</legend>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.map((r, i) => (
        <div key={i} className="grid gap-2 md:grid-cols-[1fr_2fr_1fr_auto]">
          <input
            aria-label="ชื่อลิงก์"
            placeholder="ชื่อ"
            value={r.label}
            onChange={(e) => set(i, { label: e.target.value })}
            className={input}
          />
          <input
            aria-label="URL"
            placeholder="https://"
            value={r.url}
            onChange={(e) => set(i, { url: e.target.value })}
            className={input}
          />
          <input
            aria-label="ไอคอน"
            placeholder="ไอคอน เช่น github"
            value={r.icon}
            onChange={(e) => set(i, { icon: e.target.value })}
            className={input}
          />
          <button
            type="button"
            className="text-sm text-danger"
            onClick={() => setRows((x) => x.filter((_, j) => j !== i))}
          >
            ลบ
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={rows.length >= MAX}
        onClick={() => setRows((x) => [...x, { label: "", url: "", icon: "" }])}
        className="rounded-full border border-border px-3.5 py-1 transition hover:bg-ghost text-sm disabled:opacity-50"
      >
        เพิ่มลิงก์
      </button>
    </fieldset>
  );
}
