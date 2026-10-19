// Admin "ดูตัวอย่าง" link target. Use a plain <a>, never next/link, so prefetching cannot hit it.
export function previewHref(path: string): string {
  return `/api/preview?path=${encodeURIComponent(path)}`;
}
