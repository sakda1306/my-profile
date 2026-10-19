import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/admin/ActionForm";
import { BilingualField } from "@/components/admin/BilingualField";
import { requireAdmin } from "@/lib/auth/require-admin";
import { docToPlain } from "@/lib/richtext/plain";
import { isTranslateEnabled } from "@/lib/translate/gemini";
import { updateSection } from "../actions";
import { SectionItems } from "../SectionItems";

const input = "w-full rounded-card border border-border bg-bg px-3 py-2 text-fg";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SYSTEM_NOTE: Record<string, string> = {
  hero: "แก้ชื่อ รูป และคำแนะนำตัวได้ที่หน้า โปรไฟล์",
  skills: "แก้ความสามารถได้ที่หน้า ความสามารถ",
  projects: "แก้โปรเจกต์ได้ที่หน้า โปรเจกต์",
  certificates: "แก้ใบประกาศได้ที่หน้า ใบประกาศ",
  latest_posts: "บทความมาจากหน้า บทความ",
  contact: "ลิงก์ติดต่อแก้ได้ที่หน้า โปรไฟล์",
};

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { data: section } = await supabase.from("sections").select("*").eq("id", id).maybeSingle();
  if (!section) notFound();

  const settings =
    section.settings && typeof section.settings === "object" && !Array.isArray(section.settings)
      ? (section.settings as { columns?: number; limit?: number })
      : {};
  const hasItems = ["gallery", "cards", "timeline"].includes(section.type);
  const hasColumns = section.type === "gallery" || section.type === "cards";
  const hasLimit = section.type === "latest_posts";
  const translateEnabled = isTranslateEnabled();
  const items = hasItems
    ? ((
        await supabase
          .from("section_items")
          .select(
            "id, title_th, title_en, body_th, body_en, image_path, link_url, start_date, end_date, is_visible",
          )
          .eq("section_id", section.id)
          .order("sort_order", { ascending: true })
      ).data ?? [])
    : [];

  return (
    <main className="space-y-6">
      <Link href="/admin/sections" className="text-sm text-muted">
        กลับไปรายการ
      </Link>
      <h1 className="text-2xl font-semibold">แก้ไขหมวด</h1>
      {SYSTEM_NOTE[section.type] ? (
        <p className="rounded-card border border-border p-3 text-sm text-muted">
          {SYSTEM_NOTE[section.type]}
        </p>
      ) : null}
      <ActionForm action={updateSection}>
        <input type="hidden" name="id" value={section.id} />
        <BilingualField name="title" label="ชื่อหมวด" translateEnabled={translateEnabled} defaultTh={section.title_th} defaultEn={section.title_en} />
        <BilingualField name="subtitle" label="คำโปรย" kind="textarea" translateEnabled={translateEnabled} defaultTh={section.subtitle_th} defaultEn={section.subtitle_en} />
        {section.type === "rich_text" ? (
          <BilingualField name="body" label="เนื้อหา" kind="richtext" translateEnabled={translateEnabled} defaultTh={docToPlain(section.body_th)} defaultEn={docToPlain(section.body_en)} />
        ) : null}
        <label className="block">
          <span className="mb-1 block text-sm text-muted">slug ใช้เป็นลิงก์ไปยังหมวด (เว้นว่างให้สร้างอัตโนมัติ)</span>
          <input name="slug" maxLength={80} defaultValue={section.slug} className={input} />
        </label>
        {hasColumns ? (
          <label className="block">
            <span className="mb-1 block text-sm text-muted">จำนวนคอลัมน์ (1-4)</span>
            <input name="columns" type="number" min={1} max={4} step={1} defaultValue={settings.columns ?? ""} className={input} />
          </label>
        ) : null}
        {hasLimit ? (
          <label className="block">
            <span className="mb-1 block text-sm text-muted">จำนวนบทความที่แสดง (1-12)</span>
            <input name="limit" type="number" min={1} max={12} step={1} defaultValue={settings.limit ?? ""} className={input} />
          </label>
        ) : null}
      </ActionForm>
      {hasItems ? (
        <SectionItems
          sectionId={section.id}
          type={section.type as "gallery" | "cards" | "timeline"}
          items={items}
          translateEnabled={translateEnabled}
        />
      ) : null}
    </main>
  );
}
