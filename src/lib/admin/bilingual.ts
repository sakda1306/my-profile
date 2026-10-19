import { z } from "zod";

// Returns the `{name_th, name_en}` zod shape (each language optional, trimmed, max length).
// It takes no `required` option on purpose: to require "at least one language" use
// withBilingual(), which applies atLeastOne for you.
export function bilingual(name: string, opts: { max: number }) {
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

export type BilingualSpec = { name: string; required: boolean; max: number };

// Builds one object schema from extra fields plus any number of bilingual fields, and applies
// the at-least-one rule for each spec with required:true. Example:
//   withBilingual({ slug: z.string() }, [
//     { name: "title", required: true, max: 120 },
//     { name: "summary", required: false, max: 400 },
//   ])
export function withBilingual<S extends z.ZodRawShape>(base: S, specs: BilingualSpec[]) {
  const shape: z.ZodRawShape = { ...base };
  for (const sp of specs) Object.assign(shape, bilingual(sp.name, { max: sp.max }));
  const required = specs.filter((sp) => sp.required);
  return z.object(shape).superRefine((val, ctx) => {
    for (const sp of required) atLeastOne(sp.name)(val as Record<string, unknown>, ctx);
  });
}
