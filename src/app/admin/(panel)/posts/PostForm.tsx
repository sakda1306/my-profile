"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/admin/ActionForm";
import type { ActionResult } from "@/lib/admin/result";
import { upsertPost } from "./actions";

// A new post jumps to its edit page after saving so it can be published from there.
export function PostForm({ isNew, children }: { isNew: boolean; children: ReactNode }) {
  const router = useRouter();
  async function action(form: FormData): Promise<ActionResult> {
    const res = await upsertPost(form);
    if (res.ok && isNew && res.data) router.push(`/admin/posts/${res.data.id}`);
    return res.ok ? { ok: true } : res;
  }
  return <ActionForm action={action}>{children}</ActionForm>;
}
