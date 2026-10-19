import type { TiptapDoc, TiptapNode } from "@/lib/richtext/texts";

const LINK_PROTOCOLS = ["http:", "https:", "mailto:"];
const IMAGE_PROTOCOLS = ["http:", "https:"];

function protocolOf(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    return new URL(value.trim()).protocol;
  } catch {
    return null;
  }
}

function allowed(value: unknown, protocols: string[]): boolean {
  const p = protocolOf(value);
  return p !== null && protocols.includes(p);
}

function cleanNodes(nodes: TiptapNode[]): TiptapNode[] {
  const out: TiptapNode[] = [];
  for (const node of nodes) {
    if (node.type === "image" && !allowed(node.attrs?.src, IMAGE_PROTOCOLS)) continue;
    const next: TiptapNode = { ...node };
    if (node.marks) {
      next.marks = node.marks.filter(
        (m) => m.type !== "link" || allowed(m.attrs?.href, LINK_PROTOCOLS),
      );
      if (next.marks.length === 0) delete next.marks;
    }
    if (node.content) next.content = cleanNodes(node.content);
    out.push(next);
  }
  return out;
}

// Pure and non-mutating. Drops link marks whose href is not http, https or mailto (the text
// stays) and image nodes whose src is not http(s). Runs on the server before store and render.
export function sanitizeDoc(doc: TiptapDoc): TiptapDoc {
  return { ...doc, content: cleanNodes(doc.content ?? []) };
}
