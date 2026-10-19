"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { SortableList } from "@/components/admin/SortableList";
import { uploadMedia } from "@/lib/media/upload";
import { mediaUrl } from "@/lib/media/url";
import { addProjectImage, updateProjectImageCaption } from "./actions";

export type ProjectImageItem = {
  id: string;
  path: string;
  caption_th: string;
  caption_en: string;
};

const input = "w-full rounded-xl border border-border bg-night-deep/60 px-3 py-1.5 text-fg transition focus:border-ember focus:outline-none focus:ring-3 focus:ring-ember/25";

function Caption({ item }: { item: ProjectImageItem }) {
  const [th, setTh] = useState(item.caption_th);
  const [en, setEn] = useState(item.caption_en);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      const res = await updateProjectImageCaption(item.id, th, en);
      setMsg(res.ok ? { ok: true, text: "บันทึกแล้ว" } : { ok: false, text: res.error });
    });
  }

  return (
    <div className="space-y-2">
      <input
        aria-label="คำบรรยาย (ไทย)"
        placeholder="คำบรรยาย (ไทย)"
        maxLength={200}
        value={th}
        onChange={(e) => setTh(e.target.value)}
        className={input}
      />
      <input
        aria-label="Caption (English)"
        placeholder="Caption (English)"
        maxLength={200}
        value={en}
        onChange={(e) => setEn(e.target.value)}
        className={input}
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className="text-sm underline">
          {pending ? "กำลังบันทึก..." : "บันทึกคำบรรยาย"}
        </button>
        {msg ? (
          <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-sm" : "text-sm text-danger"}>
            {msg.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectImages({
  projectId,
  images,
}: {
  projectId: string;
  images: ProjectImageItem[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setBusy(true);
    setErrors([]);
    const errs: string[] = [];
    for (const file of files) {
      const up = await uploadMedia(file, "projects");
      if ("error" in up) {
        errs.push(`${file.name}: ${up.error}`);
        continue;
      }
      const res = await addProjectImage(projectId, up.path);
      if (!res.ok) errs.push(`${file.name}: ${res.error}`);
    }
    setBusy(false);
    setErrors(errs);
    router.refresh();
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">รูปภาพโปรเจกต์</h2>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={pick}
        disabled={busy}
        className="text-sm"
      />
      {busy ? <p className="text-sm text-muted">กำลังอัปโหลด...</p> : null}
      {errors.map((m) => (
        <p key={m} role="alert" className="text-sm text-danger">
          {m}
        </p>
      ))}
      {images.length === 0 ? (
        <p className="text-muted">ยังไม่มีรูป</p>
      ) : (
        <SortableList
          key={images.map((i) => i.id).join(",")}
          items={images}
          table="project_images"
          renderItem={(img) => (
            <div className="flex flex-wrap items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(img.path) ?? ""}
                alt=""
                className="h-24 w-32 rounded-card border border-border object-cover"
              />
              <div className="min-w-48 flex-1">
                <Caption item={img} />
              </div>
              <ConfirmDelete
                table="project_images"
                id={img.id}
                label="รูปนี้"
                onDeleted={() => router.refresh()}
              />
            </div>
          )}
        />
      )}
    </section>
  );
}
