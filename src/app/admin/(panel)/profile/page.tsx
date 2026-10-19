import { ActionForm } from "@/components/admin/ActionForm";
import { BilingualField } from "@/components/admin/BilingualField";
import { LinksEditor, type LinkRow } from "@/components/admin/LinksEditor";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { asDoc } from "@/lib/admin/doc-field";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isTranslateEnabled } from "@/lib/translate/gemini";
import { saveProfile } from "./actions";

const input = "w-full rounded-card border border-border bg-bg px-3 py-2 text-fg";

export default async function ProfilePage() {
  const { supabase } = await requireAdmin();
  const { data: p } = await supabase.from("profile").select("*").eq("id", true).maybeSingle();
  const translateEnabled = isTranslateEnabled();
  const links = Array.isArray(p?.links) ? (p.links as LinkRow[]) : [];

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">โปรไฟล์</h1>
      <ActionForm action={saveProfile}>
        <BilingualField name="full_name" label="ชื่อ-นามสกุล" translateEnabled={translateEnabled} defaultTh={p?.full_name_th} defaultEn={p?.full_name_en} />
        <BilingualField name="headline" label="คำโปรย" translateEnabled={translateEnabled} defaultTh={p?.headline_th} defaultEn={p?.headline_en} />
        <BilingualField name="university" label="มหาวิทยาลัย" translateEnabled={translateEnabled} defaultTh={p?.university_th} defaultEn={p?.university_en} />
        <BilingualField name="location" label="ที่อยู่" translateEnabled={translateEnabled} defaultTh={p?.location_th} defaultEn={p?.location_en} />
        <BilingualField name="hero_badge" label="ป้ายยศในหน้าแรก (เช่น S RANK)" translateEnabled={translateEnabled} defaultTh={p?.hero_badge_th} defaultEn={p?.hero_badge_en} />
        <BilingualField name="bio" label="เกี่ยวกับฉัน" kind="richtext" imageFolder="profile" translateEnabled={translateEnabled} defaultDocTh={asDoc(p?.bio_th)} defaultDocEn={asDoc(p?.bio_en)} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-muted">อีเมล</span>
            <input name="email" type="email" defaultValue={p?.email ?? ""} className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">GitHub username</span>
            <input name="github_username" defaultValue={p?.github_username ?? ""} className={input} />
          </label>
        </div>
        <LinksEditor name="links" defaultValue={links} />
        <fieldset className="space-y-2">
          <legend className="font-medium">รูปโปรไฟล์</legend>
          <MediaUpload name="avatar_path" folder="profile" defaultPath={p?.avatar_path} />
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="font-medium">รูปหน้าแรก (โปสเตอร์)</legend>
          <p className="text-sm text-muted">ใช้รูปที่ตัดพื้นหลังออกแล้ว (PNG หรือ WebP พื้นใส) คนอยู่กลางภาพ ถ้าไม่ใส่จะใช้รูปโปรไฟล์แทน</p>
          <MediaUpload name="hero_image_path" folder="profile" defaultPath={p?.hero_image_path} />
        </fieldset>
        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className="space-y-2">
            <legend className="font-medium">เรซูเม่ (ไทย)</legend>
            <MediaUpload name="resume_path_th" folder="resume" defaultPath={p?.resume_path_th} accept="application/pdf" />
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="font-medium">เรซูเม่ (English)</legend>
            <MediaUpload name="resume_path_en" folder="resume" defaultPath={p?.resume_path_en} accept="application/pdf" />
          </fieldset>
        </div>
      </ActionForm>
    </main>
  );
}
