"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/admin/ActionForm";
import { BilingualField } from "@/components/admin/BilingualField";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { SortableList } from "@/components/admin/SortableList";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import type { ActionResult } from "@/lib/admin/result";
import { mediaUrl } from "@/lib/media/url";
import { upsertSectionItem } from "./actions";

export type SectionItemRow = {
  id: string;
  title_th: string;
  title_en: string;
  body_th: string;
  body_en: string;
  image_path: string | null;
  link_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_visible: boolean;
};

type ItemType = "gallery" | "cards" | "timeline";

const input = "w-full rounded-xl border border-border bg-night-deep/60 px-3.5 py-2.5 text-fg transition focus:border-ember focus:outline-none focus:ring-3 focus:ring-ember/25";

function ItemForm({
  sectionId,
  type,
  item,
  translateEnabled,
  onDone,
}: {
  sectionId: string;
  type: ItemType;
  item: SectionItemRow | null;
  translateEnabled: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  async function action(form: FormData): Promise<ActionResult> {
    const res = await upsertSectionItem(form);
    if (res.ok) {
      router.refresh();
      onDone();
    }
    return res;
  }
  return (
    <div className="space-y-3 rounded-card border border-border p-4">
      <ActionForm action={action} submitLabel={item ? "บันทึกรายการ" : "เพิ่มรายการ"}>
        <input type="hidden" name="section_id" value={sectionId} />
        <input type="hidden" name="id" value={item?.id ?? ""} />
        <BilingualField
          name="title"
          label={type === "gallery" ? "คำบรรยาย (ไม่บังคับ)" : "หัวข้อ"}
          translateEnabled={translateEnabled}
          defaultTh={item?.title_th}
          defaultEn={item?.title_en}
        />
        {type !== "gallery" ? (
          <BilingualField
            name="body"
            label="คำอธิบาย (ไม่บังคับ)"
            kind="textarea"
            translateEnabled={translateEnabled}
            defaultTh={item?.body_th}
            defaultEn={item?.body_en}
          />
        ) : null}
        {type !== "timeline" ? (
          <fieldset className="space-y-2">
            <legend className="font-medium">{type === "gallery" ? "รูปภาพ (จำเป็น)" : "รูปภาพ (ไม่บังคับ)"}</legend>
            <MediaUpload name="image_path" folder="sections" defaultPath={item?.image_path} />
          </fieldset>
        ) : null}
        {type === "cards" ? (
          <label className="block">
            <span className="mb-1 block text-sm text-muted">ลิงก์ (ไม่บังคับ)</span>
            <input name="link_url" type="url" defaultValue={item?.link_url ?? ""} className={input} />
          </label>
        ) : null}
        {type === "timeline" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-muted">วันที่เริ่ม (จำเป็น)</span>
              <input name="start_date" type="date" defaultValue={item?.start_date ?? ""} className={input} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-muted">วันที่สิ้นสุด (ไม่บังคับ)</span>
              <input name="end_date" type="date" defaultValue={item?.end_date ?? ""} className={input} />
            </label>
          </div>
        ) : null}
      </ActionForm>
      <button type="button" onClick={onDone} className="text-sm text-muted underline">
        ปิดฟอร์ม
      </button>
    </div>
  );
}

export function SectionItems({
  sectionId,
  type,
  items,
  translateEnabled,
}: {
  sectionId: string;
  type: ItemType;
  items: SectionItemRow[];
  translateEnabled: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const current = editing && editing !== "new" ? (items.find((i) => i.id === editing) ?? null) : null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">รายการในหมวด</h2>
        <button type="button" onClick={() => setEditing("new")} className="underline">
          เพิ่มรายการ
        </button>
      </div>
      {editing ? (
        <ItemForm
          key={editing}
          sectionId={sectionId}
          type={type}
          item={current}
          translateEnabled={translateEnabled}
          onDone={() => setEditing(null)}
        />
      ) : null}
      {items.length === 0 ? (
        <p className="text-muted">ยังไม่มีรายการ</p>
      ) : (
        <SortableList
          key={items.map((i) => i.id).join(",")}
          items={items}
          table="section_items"
          renderItem={(it) => (
            <div className="flex flex-wrap items-center gap-3">
              {it.image_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(it.image_path) ?? ""}
                  alt=""
                  className="h-16 w-24 rounded-card border border-border object-cover"
                />
              ) : null}
              <div className="min-w-32 flex-1">
                <p className="font-medium">{it.title_th || it.title_en || "(ไม่มีหัวข้อ)"}</p>
                {it.start_date ? (
                  <p className="text-sm text-muted">
                    {it.start_date}
                    {it.end_date ? ` ถึง ${it.end_date}` : ""}
                  </p>
                ) : null}
              </div>
              <VisibilityToggle table="section_items" id={it.id} visible={it.is_visible} />
              <button type="button" onClick={() => setEditing(it.id)} className="underline">
                แก้ไข
              </button>
              <ConfirmDelete
                table="section_items"
                id={it.id}
                label="รายการนี้"
                onDeleted={() => router.refresh()}
              />
            </div>
          )}
        />
      )}
    </section>
  );
}
