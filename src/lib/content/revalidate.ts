import { revalidatePath, updateTag } from "next/cache";

// Tag carried by every cached public read in queries.ts.
export const CONTENT_TAG = "content";

// Called from server actions only (updateTag requires that). Expires the cached
// public reads immediately so the next visit renders fresh data.
export function revalidatePublic(): void {
  updateTag(CONTENT_TAG);
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
}
