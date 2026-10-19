import { generateHTML } from "@tiptap/html";
import { richTextExtensions } from "@/lib/richtext/extensions";
import { sanitizeDoc } from "@/lib/richtext/sanitize";
import type { TiptapDoc } from "@/lib/richtext/texts";

// Output is HTML built from the schema (text is escaped), after sanitizeDoc.
export function renderRichText(doc: TiptapDoc | null): string {
  if (!doc || typeof doc !== "object" || doc.type !== "doc") return "";
  try {
    return generateHTML(sanitizeDoc(doc) as Parameters<typeof generateHTML>[0], richTextExtensions());
  } catch {
    return "";
  }
}
