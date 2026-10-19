export type TiptapMark = { type: string; attrs?: Record<string, unknown> };
export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
  text?: string;
  content?: TiptapNode[];
};
export type TiptapDoc = { type: "doc"; content?: TiptapNode[] };

export class TranslationShapeError extends Error {
  constructor(message = "Translated text count does not match the document") {
    super(message);
    this.name = "TranslationShapeError";
  }
}

// Text that must stay untouched: code blocks and inline code.
function isTranslatable(node: TiptapNode, inCodeBlock: boolean): boolean {
  if (inCodeBlock || node.type !== "text" || typeof node.text !== "string") return false;
  return !node.marks?.some((m) => m.type === "code");
}

function walk(nodes: TiptapNode[] | undefined, inCode: boolean, visit: (n: TiptapNode) => void) {
  for (const node of nodes ?? []) {
    if (isTranslatable(node, inCode)) visit(node);
    walk(node.content, inCode || node.type === "codeBlock", visit);
  }
}

export function extractTexts(doc: TiptapDoc): string[] {
  const out: string[] = [];
  walk(doc.content, false, (n) => out.push(n.text as string));
  return out;
}

export function applyTexts(doc: TiptapDoc, texts: string[]): TiptapDoc {
  const copy = structuredClone(doc);
  let i = 0;
  const expected = extractTexts(doc).length;
  if (expected !== texts.length) throw new TranslationShapeError();
  walk(copy.content, false, (n) => {
    n.text = texts[i++];
  });
  return copy;
}
