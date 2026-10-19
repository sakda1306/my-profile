"use client";

import { useState } from "react";
import { uploadMedia } from "@/lib/media/upload";
import { mediaUrl } from "@/lib/media/url";

export function MediaUpload({
  name,
  folder,
  defaultPath = null,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  onChange,
}: {
  name: string;
  folder: string;
  defaultPath?: string | null;
  accept?: string;
  onChange?: (path: string | null) => void;
}) {
  const [path, setPath] = useState<string | null>(defaultPath);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPdf = path?.toLowerCase().endsWith(".pdf") ?? false;

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    const res = await uploadMedia(file, folder);
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setPath(res.path);
    onChange?.(res.path);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={path ?? ""} />
      {path && !isPdf ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(path) ?? ""}
          alt=""
          className="max-h-40 rounded-card border border-border"
        />
      ) : null}
      {path && isPdf ? <p className="text-sm text-muted">{path}</p> : null}
      <div className="flex items-center gap-2">
        <input type="file" accept={accept} onChange={pick} disabled={busy} className="text-sm" />
        {path ? (
          <button
            type="button"
            className="text-sm text-danger"
            onClick={() => {
              setPath(null);
              onChange?.(null);
            }}
          >
            เอาออก
          </button>
        ) : null}
      </div>
      {busy ? <p className="text-sm text-muted">กำลังอัปโหลด...</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
