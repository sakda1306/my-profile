"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { richTextExtensions } from "@/lib/richtext/extensions";
import type { TiptapDoc } from "@/lib/richtext/texts";
import { uploadMedia } from "@/lib/media/upload";
import { mediaUrl } from "@/lib/media/url";

const EMPTY: TiptapDoc = { type: "doc", content: [{ type: "paragraph" }] };

type Props = {
  value: TiptapDoc | null;
  onChange: (doc: TiptapDoc) => void;
  /** When set, a hidden input with JSON.stringify(doc) is rendered so plain forms keep working. */
  name?: string;
  /** Storage folder for images inserted in the editor. */
  folder?: string;
  label?: string;
};

function Btn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active ?? false}
      className={`rounded-full border border-border px-2.5 py-1 transition hover:bg-ghost text-sm disabled:opacity-50 ${
        active ? "bg-accent text-on-accent" : "bg-bg text-fg"
      }`}
    >
      {label}
    </button>
  );
}

function Toolbar({ editor, folder }: { editor: Editor; folder: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      code: e.isActive("code"),
      codeBlock: e.isActive("codeBlock"),
      link: e.isActive("link"),
    }),
  });
  const run = () => editor.chain().focus();

  function setLink() {
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("ลิงก์ (http://, https:// หรือ mailto:)", prev);
    if (url === null) return;
    if (url.trim() === "") {
      run().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) {
      setError("ลิงก์ต้องขึ้นต้นด้วย http://, https:// หรือ mailto:");
      return;
    }
    setError(null);
    run().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
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
    const src = mediaUrl(res.path);
    if (src) run().setImage({ src }).run();
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1" role="toolbar" aria-label="แถบเครื่องมือ">
        <Btn label="H2" active={s.h2} onClick={() => run().toggleHeading({ level: 2 }).run()} />
        <Btn label="H3" active={s.h3} onClick={() => run().toggleHeading({ level: 3 }).run()} />
        <Btn label="ตัวหนา" active={s.bold} onClick={() => run().toggleBold().run()} />
        <Btn label="ตัวเอียง" active={s.italic} onClick={() => run().toggleItalic().run()} />
        <Btn label="รายการ" active={s.bullet} onClick={() => run().toggleBulletList().run()} />
        <Btn label="รายการลำดับ" active={s.ordered} onClick={() => run().toggleOrderedList().run()} />
        <Btn label="อ้างอิง" active={s.quote} onClick={() => run().toggleBlockquote().run()} />
        <Btn label="โค้ด" active={s.code} onClick={() => run().toggleCode().run()} />
        <Btn label="บล็อกโค้ด" active={s.codeBlock} onClick={() => run().toggleCodeBlock().run()} />
        <Btn label="ลิงก์" active={s.link} onClick={setLink} />
        <Btn
          label={busy ? "กำลังอัปโหลด..." : "รูป"}
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={pickImage}
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TiptapEditor({ value, onChange, name, folder = "posts", label }: Props) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const editor = useEditor({
    extensions: richTextExtensions(),
    content: (value ?? EMPTY) as object,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "rich-text min-h-48 rounded-xl border border-border bg-night-deep/60 px-4 py-3 text-fg transition focus:border-ember focus:outline-none focus:ring-3 focus:ring-ember/25",
        ...(label ? { "aria-label": label } : {}),
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current(e.getJSON() as TiptapDoc),
  });

  // Keep the editor in sync when the parent replaces the value (for example after translating).
  useEffect(() => {
    if (!editor) return;
    const next = value ?? EMPTY;
    if (JSON.stringify(next) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(next as object, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="space-y-2">
      {name ? <input type="hidden" name={name} value={JSON.stringify(value ?? EMPTY)} /> : null}
      {editor ? <Toolbar editor={editor} folder={folder} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
