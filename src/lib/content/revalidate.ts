import { revalidatePath } from "next/cache";

export function revalidatePublic(): void {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
}
