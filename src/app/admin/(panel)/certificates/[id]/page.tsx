import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/admin/ActionForm";
import { BilingualField } from "@/components/admin/BilingualField";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isTranslateEnabled } from "@/lib/translate/gemini";
import { upsertCertificate } from "../actions";

const input = "w-full rounded-card border border-border bg-bg px-3 py-2 text-fg";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Every admin page reads the session per request, so navigations block on the server.
export const instant = false;

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();

  const cert = isNew
    ? null
    : (await supabase.from("certificates").select("*").eq("id", id).maybeSingle()).data;
  if (!isNew && !cert) notFound();
  const translateEnabled = isTranslateEnabled();

  return (
    <main className="space-y-4">
      <Link href="/admin/certificates" className="text-sm text-muted">
        กลับไปรายการ
      </Link>
      <h1 className="text-2xl font-semibold">{isNew ? "เพิ่มใบประกาศ" : "แก้ไขใบประกาศ"}</h1>
      <ActionForm action={upsertCertificate} redirectTo="/admin/certificates">
        <input type="hidden" name="id" value={cert?.id ?? ""} />
        <BilingualField name="title" label="ชื่อใบประกาศ" translateEnabled={translateEnabled} defaultTh={cert?.title_th} defaultEn={cert?.title_en} />
        <label className="block">
          <span className="mb-1 block text-sm text-muted">ผู้ออก</span>
          <input name="issuer" maxLength={120} defaultValue={cert?.issuer ?? ""} className={input} />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-muted">วันที่ออก</span>
            <input name="issued_on" type="date" required defaultValue={cert?.issued_on ?? ""} className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">วันหมดอายุ (ไม่บังคับ)</span>
            <input name="expires_on" type="date" defaultValue={cert?.expires_on ?? ""} className={input} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">ลิงก์ตรวจสอบ (ไม่บังคับ)</span>
          <input name="credential_url" type="url" defaultValue={cert?.credential_url ?? ""} className={input} />
        </label>
        <fieldset className="space-y-2">
          <legend className="font-medium">รูปใบประกาศ</legend>
          <MediaUpload name="image_path" folder="certificates" defaultPath={cert?.image_path} />
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="font-medium">ไฟล์ PDF</legend>
          <MediaUpload name="file_path" folder="certificates" defaultPath={cert?.file_path} accept="application/pdf" />
        </fieldset>
      </ActionForm>
    </main>
  );
}
