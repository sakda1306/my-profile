const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_PDF = 10 * 1024 * 1024;

export function classifyUpload(f: {
  type: string;
  size: number;
}): { kind: "image" } | { kind: "pdf" } | { error: string } {
  if (IMAGE_TYPES.includes(f.type)) return { kind: "image" };
  if (f.type === "application/pdf") {
    return f.size > MAX_PDF
      ? { error: "ไฟล์ PDF ต้องไม่เกิน 10 MB" }
      : { kind: "pdf" };
  }
  if (f.type === "image/heic" || f.type === "image/heif") {
    return { error: "ไม่รองรับไฟล์ HEIC กรุณาแปลงเป็น JPG หรือ PNG ก่อนอัปโหลด" };
  }
  return { error: "รองรับเฉพาะรูป JPG, PNG, WebP, GIF และไฟล์ PDF" };
}
