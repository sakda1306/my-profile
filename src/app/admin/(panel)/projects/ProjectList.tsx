"use client";

import Link from "next/link";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { SortableList } from "@/components/admin/SortableList";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { previewHref } from "@/lib/admin/preview-link";

export type ProjectItem = { id: string; slug: string; title: string; is_featured: boolean; is_visible: boolean };

export function ProjectList({ items }: { items: ProjectItem[] }) {
  return (
    <SortableList
      items={items}
      table="projects"
      renderItem={(p) => (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <p className="font-medium">{p.title}</p>
            {p.is_featured ? <p className="text-sm text-muted">แนะนำ</p> : null}
          </div>
          <VisibilityToggle table="projects" id={p.id} visible={p.is_visible} />
          <Link href={`/admin/projects/${p.id}`}>แก้ไข</Link>
          {p.is_visible ? null : <a href={previewHref(`/th/projects/${p.slug}`)}>ดูตัวอย่าง</a>}
          <ConfirmDelete table="projects" id={p.id} label={`โปรเจกต์ ${p.title}`} />
        </div>
      )}
    />
  );
}
