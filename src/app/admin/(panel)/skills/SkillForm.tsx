import { ActionForm } from "@/components/admin/ActionForm";
import { BilingualField } from "@/components/admin/BilingualField";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { CATEGORY_LABEL, SKILL_CATEGORIES } from "@/lib/admin/schemas";
import type { Database } from "@/lib/supabase/database.types";
import { upsertSkill } from "./actions";

type Skill = Database["public"]["Tables"]["skills"]["Row"];
const input = "w-full rounded-card border border-border bg-bg px-3 py-2 text-fg";

export function SkillForm({
  skill,
  translateEnabled,
}: {
  skill?: Skill;
  translateEnabled: boolean;
}) {
  return (
    <ActionForm action={upsertSkill} submitLabel={skill ? "บันทึก" : "เพิ่ม"}>
      <input type="hidden" name="id" value={skill?.id ?? ""} />
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">ชื่อ</span>
          <input name="name" required maxLength={60} defaultValue={skill?.name ?? ""} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">หมวด</span>
          <select name="category" defaultValue={skill?.category ?? "language"} className={input}>
            {SKILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">icon slug (a-z, 0-9)</span>
          <input name="icon_slug" defaultValue={skill?.icon_slug ?? ""} className={input} />
        </label>
      </div>
      <BilingualField name="note" label="หมายเหตุ" translateEnabled={translateEnabled} defaultTh={skill?.note_th} defaultEn={skill?.note_en} />
      <fieldset className="space-y-2">
        <legend className="text-sm text-muted">ไอคอนที่อัปโหลดเอง (ไม่บังคับ)</legend>
        <MediaUpload name="icon_path" folder="skills" defaultPath={skill?.icon_path} />
      </fieldset>
    </ActionForm>
  );
}
