import { z } from "zod";

// Returns the `{name_th, name_en}` zod shape. Each language is optional on its own;
// `required` only means "at least one language" and is enforced by atLeastOne(name),
// so callers use bilingualObject() (which wires it up) rather than z.object(bilingual(...)).
export function bilingual(name: string, opts: { required: boolean; max: number }) {
  const field = () => z.string().trim().max(opts.max);
  return { [`${name}_th`]: field(), [`${name}_en`]: field() } as Record<
    `${string}_th` | `${string}_en`,
    z.ZodString
  >;
}

export function atLeastOne(name: string) {
  return (val: Record<string, unknown>, ctx: z.RefinementCtx) => {
    const th = String(val[`${name}_th`] ?? "").trim();
    const en = String(val[`${name}_en`] ?? "").trim();
    if (!th && !en) {
      ctx.addIssue({
        code: "custom",
        message: "กรอกอย่างน้อยหนึ่งภาษา",
        path: [`${name}_th`],
      });
    }
  };
}

export function friendlyDbError(e: { code?: string }): string {
  return e.code === "23505"
    ? "slug หรือค่านี้ถูกใช้แล้ว"
    : "บันทึกไม่สำเร็จ ลองอีกครั้ง";
}

// Safe wrapper: builds the object schema and applies atLeastOne when required is true.
export function bilingualObject(name: string, opts: { required: boolean; max: number }) {
  const base = z.object(bilingual(name, opts));
  return opts.required ? base.superRefine(atLeastOne(name)) : base;
}
