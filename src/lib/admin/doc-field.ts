import { sanitizeDoc } from "@/lib/richtext/sanitize";
import type { TiptapDoc } from "@/lib/richtext/texts";
import { tiptapDocSchema } from "@/lib/admin/schemas";

const BAD_DOC = "เนื้อหาไม่ถูกต้อง";

// A doc with nothing but empty paragraphs is "no content".
export function isEmptyDoc(doc: TiptapDoc): boolean {
  return (doc.content ?? []).every((n) => n.type === "paragraph" && !n.content?.length);
}

// Reads a JSON-encoded Tiptap doc from a form value. "" -> null. The result is sanitized and
// an empty editor becomes null.
export function parseDocField(raw: string): { ok: true; doc: TiptapDoc | null } | { ok: false; error: string } {
  if (!raw.trim()) return { ok: true, doc: null };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: BAD_DOC };
  }
  const parsed = tiptapDocSchema.safeParse(json);
  if (!parsed.success) return { ok: false, error: BAD_DOC };
  const doc = sanitizeDoc(parsed.data as TiptapDoc);
  return { ok: true, doc: isEmptyDoc(doc) ? null : doc };
}

// For loading a stored value into the editor. Anything that is not a doc gives null.
export function asDoc(value: unknown): TiptapDoc | null {
  const parsed = tiptapDocSchema.safeParse(value);
  return parsed.success ? (parsed.data as TiptapDoc) : null;
}

