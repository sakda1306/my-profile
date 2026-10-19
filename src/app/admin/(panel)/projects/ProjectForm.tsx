"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/admin/ActionForm";
import type { ActionResult } from "@/lib/admin/result";
import { upsertProject } from "./actions";

// A new project jumps to its edit page after saving so images can be added there.
export function ProjectForm({ isNew, children }: { isNew: boolean; children: ReactNode }) {
  const router = useRouter();
  async function action(form: FormData): Promise<ActionResult> {
    const res = await upsertProject(form);
    if (res.ok && isNew && res.data) router.push(`/admin/projects/${res.data.id}`);
    return res.ok ? { ok: true } : res;
  }
  return <ActionForm action={action}>{children}</ActionForm>;
}
