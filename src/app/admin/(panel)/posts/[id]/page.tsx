import Link from "next/link";
import { notFound } from "next/navigation";
import { BilingualField } from "@/components/admin/BilingualField";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { asDoc } from "@/lib/admin/doc-field";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isTranslateEnabled } from "@/lib/translate/gemini";
import { PostForm } from "../PostForm";
import { PostStatusButton } from "../PostStatusButton";

const input = "w-full rounded-card border border-border bg-bg px-3 py-2 text-fg";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Every admin page reads the session per request, so navigations block on the server.
export const instant = false;

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();

  const post = isNew
    ? null
    : (await supabase.from("posts").select("*").eq("id", id).maybeSingle()).data;
  if (!isNew && !post) notFound();
  const translateEnabled = isTranslateEnabled();

  return (
    <main className="space-y-6">
      <Link href="/admin/posts" className="text-sm text-muted">
        กลับไปรายการ
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{isNew ? "เขียนบทความ" : "แก้ไขบทความ"}</h1>
        {post ? (
          <>
            <span className="text-sm text-muted">
              {post.status === "published" ? "เผยแพร่แล้ว" : "ร่าง"}
            </span>
            <PostStatusButton id={post.id} status={post.status} />
          </>
        ) : null}
      </div>
      <PostForm isNew={isNew}>
        <input type="hidden" name="id" value={post?.id ?? ""} />
        <BilingualField name="title" label="หัวข้อ" translateEnabled={translateEnabled} defaultTh={post?.title_th} defaultEn={post?.title_en} />
        <BilingualField name="excerpt" label="คำโปรย" kind="textarea" translateEnabled={translateEnabled} defaultTh={post?.excerpt_th} defaultEn={post?.excerpt_en} />
        <BilingualField name="content" label="เนื้อหา" kind="richtext" imageFolder="posts" translateEnabled={translateEnabled} defaultDocTh={asDoc(post?.content_th)} defaultDocEn={asDoc(post?.content_en)} />
        <label className="block">
          <span className="mb-1 block text-sm text-muted">แท็ก (คั่นด้วยเครื่องหมายจุลภาค สูงสุด 10 แท็ก แท็กละไม่เกิน 30 ตัวอักษร)</span>
          <input name="tags" defaultValue={(post?.tags ?? []).join(", ")} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">slug (เว้นว่างให้สร้างอัตโนมัติ)</span>
          <input name="slug" maxLength={80} defaultValue={post?.slug ?? ""} className={input} />
        </label>
        <fieldset className="space-y-2">
          <legend className="font-medium">รูปปก</legend>
          <MediaUpload name="cover_path" folder="posts" defaultPath={post?.cover_path} />
        </fieldset>
      </PostForm>
    </main>
  );
}
