import Link from "next/link";
import { notFound } from "next/navigation";
import { BilingualField } from "@/components/admin/BilingualField";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { asDoc } from "@/lib/admin/doc-field";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isTranslateEnabled } from "@/lib/translate/gemini";
import { ProjectForm } from "../ProjectForm";
import { ProjectImages } from "../ProjectImages";

const input = "w-full rounded-card border border-border bg-bg px-3 py-2 text-fg";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Every admin page reads the session per request, so navigations block on the server.
export const instant = false;

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();

  const project = isNew
    ? null
    : (await supabase.from("projects").select("*").eq("id", id).maybeSingle()).data;
  if (!isNew && !project) notFound();
  const images = project
    ? ((
        await supabase
          .from("project_images")
          .select("id, path, caption_th, caption_en")
          .eq("project_id", project.id)
          .order("sort_order", { ascending: true })
      ).data ?? [])
    : [];
  const translateEnabled = isTranslateEnabled();

  return (
    <main className="space-y-6">
      <Link href="/admin/projects" className="text-sm text-muted">
        กลับไปรายการ
      </Link>
      <h1 className="text-2xl font-semibold">{isNew ? "เพิ่มโปรเจกต์" : "แก้ไขโปรเจกต์"}</h1>
      <ProjectForm isNew={isNew}>
        <input type="hidden" name="id" value={project?.id ?? ""} />
        <BilingualField name="title" label="ชื่อโปรเจกต์" translateEnabled={translateEnabled} defaultTh={project?.title_th} defaultEn={project?.title_en} />
        <BilingualField name="summary" label="สรุปสั้น ๆ" kind="textarea" translateEnabled={translateEnabled} defaultTh={project?.summary_th} defaultEn={project?.summary_en} />
        <BilingualField name="my_role" label="หน้าที่ของฉัน" kind="textarea" translateEnabled={translateEnabled} defaultTh={project?.my_role_th} defaultEn={project?.my_role_en} />
        <BilingualField name="body" label="รายละเอียด" kind="richtext" imageFolder="projects" translateEnabled={translateEnabled} defaultDocTh={asDoc(project?.body_th)} defaultDocEn={asDoc(project?.body_en)} />
        <label className="block">
          <span className="mb-1 block text-sm text-muted">เทคโนโลยี (คั่นด้วยเครื่องหมายจุลภาค สูงสุด 15)</span>
          <input name="stack" defaultValue={(project?.stack ?? []).join(", ")} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">slug (เว้นว่างให้สร้างอัตโนมัติ)</span>
          <input name="slug" maxLength={80} defaultValue={project?.slug ?? ""} className={input} />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-muted">ลิงก์ซอร์สโค้ด (ไม่บังคับ)</span>
            <input name="repo_url" type="url" defaultValue={project?.repo_url ?? ""} className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">ลิงก์เดโม (ไม่บังคับ)</span>
            <input name="demo_url" type="url" defaultValue={project?.demo_url ?? ""} className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">วันที่เริ่ม (ไม่บังคับ)</span>
            <input name="start_date" type="date" defaultValue={project?.start_date ?? ""} className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">วันที่สิ้นสุด (ไม่บังคับ)</span>
            <input name="end_date" type="date" defaultValue={project?.end_date ?? ""} className={input} />
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_featured" defaultChecked={project?.is_featured ?? false} />
          <span>แสดงเป็นโปรเจกต์แนะนำ</span>
        </label>
        <fieldset className="space-y-2">
          <legend className="font-medium">รูปปก</legend>
          <MediaUpload name="cover_path" folder="projects" defaultPath={project?.cover_path} />
        </fieldset>
      </ProjectForm>
      {project ? (
        <ProjectImages projectId={project.id} images={images} />
      ) : (
        <p className="text-sm text-muted">บันทึกโปรเจกต์ก่อน แล้วจึงเพิ่มรูปภาพได้</p>
      )}
    </main>
  );
}
