import { describe, expect, it } from "vitest";
import { z } from "zod";
import { atLeastOne, bilingual, bilingualObject, friendlyDbError } from "@/lib/admin/bilingual";

const schema = z
  .object(bilingual("title", { required: false, max: 100 }))
  .superRefine(atLeastOne("title"));

describe("bilingual", () => {
  it("rejects both empty", () =>
    expect(schema.safeParse({ title_th: "", title_en: " " }).error?.issues[0].message).toBe(
      "กรอกอย่างน้อยหนึ่งภาษา",
    ));
  it("accepts one language", () =>
    expect(schema.safeParse({ title_th: "ก", title_en: "" }).success).toBe(true));
  it("friendlyDbError", () => {
    expect(friendlyDbError({ code: "23505" })).toBe("slug หรือค่านี้ถูกใช้แล้ว");
    expect(friendlyDbError({ code: "x" })).toBe("บันทึกไม่สำเร็จ ลองอีกครั้ง");
  });

  it("required:true needs at least one language", () => {
    const req = bilingualObject("title", { required: true, max: 100 });
    expect(req.safeParse({ title_th: "ก", title_en: "" }).success).toBe(true);
    expect(req.safeParse({ title_th: "", title_en: "" }).error?.issues[0].message).toBe(
      "กรอกอย่างน้อยหนึ่งภาษา",
    );
  });
});
