"use server";

import type { ActionResult } from "@/lib/admin/result";
import { requireAdminAction } from "@/lib/auth/require-admin";
import type { Locale } from "@/lib/locale/pick";
import { applyTexts, extractTexts, type TiptapDoc } from "@/lib/richtext/texts";
import { isTranslateEnabled, QuotaError, translateStrings } from "@/lib/translate/gemini";

type Input = { kind: "text"; text: string } | { kind: "doc"; doc: TiptapDoc };

const NO_KEY = "ยังไม่ได้ตั้งค่า GEMINI_API_KEY";
const QUOTA = "โควต้าการแปลหมดแล้ว ลองใหม่ภายหลังหรือพิมพ์เอง";
const FAILED = "แปลไม่สำเร็จ ลองอีกครั้ง";

export async function translateAction(
  input: Input,
  from: Locale,
  to: Locale,
): Promise<ActionResult<{ text?: string; doc?: TiptapDoc }>> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!isTranslateEnabled()) return { ok: false, error: NO_KEY };

  try {
    if (input.kind === "text") {
      if (!input.text.trim()) return { ok: true, data: { text: input.text } };
      const [text] = await translateStrings([input.text], from, to);
      return { ok: true, data: { text } };
    }
    const texts = extractTexts(input.doc);
    if (texts.length === 0) return { ok: true, data: { doc: input.doc } };
    const translated = await translateStrings(texts, from, to);
    return { ok: true, data: { doc: applyTexts(input.doc, translated) } };
  } catch (e) {
    return { ok: false, error: e instanceof QuotaError ? QUOTA : FAILED };
  }
}
