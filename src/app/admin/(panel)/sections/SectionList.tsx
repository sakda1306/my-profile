"use client";

import Link from "next/link";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { SortableList } from "@/components/admin/SortableList";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { previewHref } from "@/lib/admin/preview-link";
import { TYPE_LABEL, isCreatableType } from "@/lib/admin/schemas";

export type SectionRow = {
  id: string;
  type: string;
  title: string;
  is_system: boolean;
  is_visible: boolean;
};

const SYSTEM_LABEL: Record<string, string> = {
  hero: "ส่วนหัว",
  skills: "ความสามารถ",
  projects: "โปรเจกต์",
  certificates: "ใบประกาศ",
  latest_posts: "บทความล่าสุด",
  contact: "ติดต่อ",
};

export function SectionList({ items }: { items: SectionRow[] }) {
  return (
    <SortableList
      items={items}
      table="sections"
      renderItem={(s) => (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <p className="font-medium">{s.title || "(ไม่มีชื่อ)"}</p>
            <p className="text-sm text-muted">
              {isCreatableType(s.type) ? TYPE_LABEL[s.type] : (SYSTEM_LABEL[s.type] ?? s.type)}
              {s.is_system ? " · หมวดตั้งต้น" : ""}
            </p>
          </div>
          <VisibilityToggle table="sections" id={s.id} visible={s.is_visible} />
          <Link href={`/admin/sections/${s.id}`}>แก้ไข</Link>
          {s.is_visible ? null : <a href={previewHref("/th")}>ดูตัวอย่าง</a>}
          {s.is_system ? null : (
            <ConfirmDelete table="sections" id={s.id} label={`หมวด ${s.title}`} />
          )}
        </div>
      )}
    />
  );
}
