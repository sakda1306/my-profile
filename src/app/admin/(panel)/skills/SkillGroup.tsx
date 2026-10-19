"use client";

import type { ReactNode } from "react";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { SortableList } from "@/components/admin/SortableList";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";

export type SkillItem = { id: string; name: string; is_visible: boolean; form: ReactNode };

export function SkillGroup({ items }: { items: SkillItem[] }) {
  return (
    <SortableList
      items={items}
      table="skills"
      renderItem={(s) => (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex-1 font-medium">{s.name}</span>
            <VisibilityToggle table="skills" id={s.id} visible={s.is_visible} />
            <ConfirmDelete table="skills" id={s.id} label={`ทักษะ ${s.name}`} />
          </div>
          <details>
            <summary className="cursor-pointer text-sm text-muted">แก้ไข</summary>
            <div className="pt-3">{s.form}</div>
          </details>
        </div>
      )}
    />
  );
}
