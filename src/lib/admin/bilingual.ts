import { z } from "zod";

export function bilingual(name: string, opts: { required: boolean; max: number }) {
  const field = () => {
    const s = z.string().trim().max(opts.max);
    return opts.required ? s.min(1, "กรุณากรอกข้อมูล") : s;
  };
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
