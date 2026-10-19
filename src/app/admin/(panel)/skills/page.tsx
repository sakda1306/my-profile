import { requireAdmin } from "@/lib/auth/require-admin";
import { CATEGORY_LABEL, SKILL_CATEGORIES } from "@/lib/admin/schemas";
import { isTranslateEnabled } from "@/lib/translate/gemini";
import { SkillForm } from "./SkillForm";
import { SkillGroup } from "./SkillGroup";

// Every admin page reads the session per request, so navigations block on the server.
export const instant = false;

export default async function SkillsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true });
  const skills = data ?? [];
  const translateEnabled = isTranslateEnabled();

  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-black tracking-tight md:text-4xl">ความสามารถ</h1>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">เพิ่มความสามารถ</h2>
        <SkillForm translateEnabled={translateEnabled} />
      </section>
      {SKILL_CATEGORIES.map((c) => {
        const items = skills
          .filter((s) => s.category === c)
          .map((s) => ({
            id: s.id,
            name: s.name,
            is_visible: s.is_visible,
            form: <SkillForm skill={s} translateEnabled={translateEnabled} />,
          }));
        return (
          <section key={c} className="space-y-3">
            <h2 className="text-lg font-medium">{CATEGORY_LABEL[c]}</h2>
            {items.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีรายการ</p>
            ) : (
              <SkillGroup items={items} />
            )}
          </section>
        );
      })}
    </main>
  );
}
