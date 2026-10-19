export type Doc = { type: "doc"; content: { type: "paragraph"; content: { type: "text"; text: string }[] }[] };

// Plain text -> minimal Tiptap doc. Paragraphs are split on blank lines. Empty text -> null.
export function plainToDoc(text: string): Doc | null {
  const paras = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paras.length === 0) return null;
  return {
    type: "doc",
    content: paras.map((p) => ({ type: "paragraph", content: [{ type: "text", text: p }] })),
  };
}

function nodeText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: unknown; text?: unknown; content?: unknown };
  if (typeof n.text === "string") return n.text;
  if (!Array.isArray(n.content)) return "";
  return n.content.map(nodeText).join("");
}

// Tiptap doc -> plain text for the textarea. Anything unexpected gives "".
export function docToPlain(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  const content = (doc as { content?: unknown }).content;
  if (!Array.isArray(content)) return "";
  return content.map(nodeText).filter(Boolean).join("\n\n");
}
