import { PUBLIC_MEDIA_URL } from "@/lib/media/url";

export type ContentTable =
  | "skills"
  | "certificates"
  | "projects"
  | "project_images"
  | "sections"
  | "section_items"
  | "posts";

type Cols = { files: string[]; richtext: string[] };

export const STORAGE_COLUMNS: Record<ContentTable, Cols> = {
  skills: { files: ["icon_path"], richtext: [] },
  certificates: { files: ["image_path", "file_path"], richtext: [] },
  projects: { files: ["cover_path"], richtext: ["body_th", "body_en"] },
  project_images: { files: ["path"], richtext: [] },
  sections: { files: [], richtext: ["body_th", "body_en"] },
  section_items: { files: ["image_path"], richtext: [] },
  posts: { files: ["cover_path"], richtext: ["content_th", "content_en"] },
};

function walk(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const n of node) walk(n, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  const n = node as { type?: unknown; attrs?: { src?: unknown }; content?: unknown };
  if (n.type === "image" && typeof n.attrs?.src === "string") {
    if (n.attrs.src.startsWith(PUBLIC_MEDIA_URL)) {
      out.push(n.attrs.src.slice(PUBLIC_MEDIA_URL.length));
    }
  }
  walk(n.content, out);
}

export function collectStoragePaths(row: Record<string, unknown>, cols: Cols): string[] {
  const out: string[] = [];
  for (const c of cols.files) {
    const v = row[c];
    if (typeof v === "string" && v && !v.startsWith("http")) out.push(v);
  }
  for (const c of cols.richtext) walk(row[c], out);
  return [...new Set(out)];
}
