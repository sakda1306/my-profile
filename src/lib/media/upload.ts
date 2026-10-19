import { createBrowserClient } from "@/lib/supabase/browser";
import { classifyUpload } from "./classify";
import { resizeToWebp } from "./resize";

const UPLOAD_ERROR = "อัปโหลดไม่สำเร็จ ลองอีกครั้ง";

// Runs in the browser with the signed-in admin's session.
export async function uploadMedia(
  file: File,
  folder: string,
): Promise<{ path: string } | { error: string }> {
  const c = classifyUpload(file);
  if ("error" in c) return c;
  try {
    const id = crypto.randomUUID();
    let body: Blob = file;
    let ext = "pdf";
    let contentType = "application/pdf";
    if (c.kind === "image") {
      if (file.type === "image/gif") {
        ext = "gif";
        contentType = "image/gif";
      } else {
        body = await resizeToWebp(file);
        ext = "webp";
        contentType = "image/webp";
      }
    }
    const path = `${folder}/${id}.${ext}`;
    const { error } = await createBrowserClient()
      .storage.from("media")
      .upload(path, body, { contentType, upsert: false });
    if (error) return { error: UPLOAD_ERROR };
    return { path };
  } catch {
    return { error: UPLOAD_ERROR };
  }
}
