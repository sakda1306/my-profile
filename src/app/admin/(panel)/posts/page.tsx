import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { PostList } from "./PostList";

// Every admin page reads the session per request, so navigations block on the server.
export const instant = false;

export default async function PostsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title_th, title_en, status, updated_at")
    .order("updated_at", { ascending: false });
  const items = (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title_th || p.title_en,
    status: p.status,
    updated_at: p.updated_at,
  }));

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">บทความ</h1>
        <Link href="/admin/posts/new">เขียนบทความ</Link>
      </div>
      {items.length === 0 ? <p className="text-muted">ยังไม่มีบทความ</p> : <PostList items={items} />}
    </main>
  );
}
