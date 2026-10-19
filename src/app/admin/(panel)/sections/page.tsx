import { requireAdmin } from "@/lib/auth/require-admin";
import { previewHref } from "@/lib/admin/preview-link";
import { AddSectionForm } from "./AddSectionForm";
import { SectionList } from "./SectionList";

// Every admin page reads the session per request, so navigations block on the server.
export const instant = false;

export default async function SectionsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("sections")
    .select("id, type, title_th, title_en, is_system, is_visible")
    .order("sort_order", { ascending: true });
  const items = (data ?? []).map((s) => ({
    id: s.id,
    type: s.type,
    title: s.title_th || s.title_en,
    is_system: s.is_system,
    is_visible: s.is_visible,
  }));

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-black tracking-tight md:text-4xl">หมวดของหน้าแรก</h1>
      <a href={previewHref("/th")}>ดูตัวอย่างหน้าแรก</a>
      <p className="text-sm text-muted">ลากเพื่อเรียงลำดับ หมวดตั้งต้นซ่อนได้แต่ลบไม่ได้</p>
      {items.length === 0 ? <p className="text-muted">ยังไม่มีหมวด</p> : <SectionList items={items} />}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">เพิ่มหมวด</h2>
        <AddSectionForm />
      </section>
    </main>
  );
}
