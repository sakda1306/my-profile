import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ProjectList } from "./ProjectList";

// Every admin page reads the session per request, so navigations block on the server.
export const instant = false;

export default async function ProjectsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("projects")
    .select("id, slug, title_th, title_en, is_featured, is_visible")
    .order("sort_order", { ascending: true });
  const items = (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title_th || p.title_en,
    is_featured: p.is_featured,
    is_visible: p.is_visible,
  }));

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">โปรเจกต์</h1>
        <Link href="/admin/projects/new">เพิ่มโปรเจกต์</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-muted">ยังไม่มีรายการ</p>
      ) : (
        <ProjectList items={items} />
      )}
    </main>
  );
}
