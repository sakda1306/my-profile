"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { PostStatusButton } from "./PostStatusButton";

export type PostItem = {
  id: string;
  title: string;
  status: "draft" | "published";
  updated_at: string;
};

export function PostList({ items }: { items: PostItem[] }) {
  const router = useRouter();
  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-card border border-border p-3">
          <div className="flex-1">
            <p className="font-medium">{p.title}</p>
            <p className="text-sm text-muted">
              {p.status === "published" ? "เผยแพร่แล้ว" : "ร่าง"} · แก้ไขล่าสุด{" "}
              {new Date(p.updated_at).toLocaleString("th-TH")}
            </p>
          </div>
          <PostStatusButton id={p.id} status={p.status} />
          <Link href={`/admin/posts/${p.id}`}>แก้ไข</Link>
          <ConfirmDelete
            table="posts"
            id={p.id}
            label={`บทความ ${p.title}`}
            onDeleted={() => router.refresh()}
          />
        </li>
      ))}
    </ul>
  );
}
