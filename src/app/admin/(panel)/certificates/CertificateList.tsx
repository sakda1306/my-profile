"use client";

import Link from "next/link";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { SortableList } from "@/components/admin/SortableList";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";

export type CertItem = { id: string; title: string; issuer: string; is_visible: boolean };

export function CertificateList({ items }: { items: CertItem[] }) {
  return (
    <SortableList
      items={items}
      table="certificates"
      renderItem={(c) => (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <p className="font-medium">{c.title}</p>
            <p className="text-sm text-muted">{c.issuer}</p>
          </div>
          <VisibilityToggle table="certificates" id={c.id} visible={c.is_visible} />
          <Link href={`/admin/certificates/${c.id}`}>แก้ไข</Link>
          <ConfirmDelete table="certificates" id={c.id} label={`ใบประกาศ ${c.title}`} />
        </div>
      )}
    />
  );
}
