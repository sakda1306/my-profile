import { renderRichText } from "@/lib/richtext/render";
import type { TiptapDoc } from "@/lib/richtext/texts";

// Server component. renderRichText sanitizes the document and builds the HTML from the
// editor schema (text is escaped), so the markup is safe to inject.
export function RichTextView({ doc, className = "" }: { doc: TiptapDoc | null; className?: string }) {
  const html = renderRichText(doc);
  if (!html) return null;
  return <div className={`rich-text ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />;
}
