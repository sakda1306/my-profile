"use server";

import type { ActionResult } from "@/lib/admin/result";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { revalidatePublic } from "@/lib/content/revalidate";
import {
  STORAGE_COLUMNS,
  collectStoragePaths,
  type ContentTable,
} from "@/lib/admin/storage-paths";
import { friendlyDbError } from "@/lib/admin/bilingual";

const TABLES = Object.keys(STORAGE_COLUMNS) as ContentTable[];
const NO_ORDER_ERROR = "ตารางนี้ไม่รองรับการทำงานนี้";
const BAD_TABLE_ERROR = "ไม่พบตารางที่ระบุ";

// Child tables whose files must be removed together with the parent row.
const CHILDREN: Partial<Record<ContentTable, { table: ContentTable; fk: string }>> = {
  projects: { table: "project_images", fk: "project_id" },
  sections: { table: "section_items", fk: "section_id" },
};

type Row = Record<string, unknown>;
type Err = { code?: string; message?: string } | null;
// Table names are dynamic, so the typed client is narrowed to a loose shape here.
type LooseClient = {
  from(table: string): {
    select(cols: string): {
      eq(col: string, val: string): PromiseLike<{ data: Row[] | null; error: Err }>;
    };
    update(values: Row): {
      eq(col: string, val: string): PromiseLike<{ error: Err }>;
    };
    delete(): { eq(col: string, val: string): PromiseLike<{ error: Err }> };
  };
};

function valid(table: string): table is ContentTable {
  return (TABLES as string[]).includes(table);
}

export async function reorderRows(
  table: ContentTable,
  orderedIds: string[],
): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!valid(table)) return { ok: false, error: BAD_TABLE_ERROR };
  if (table === "posts") return { ok: false, error: NO_ORDER_ERROR };
  const db = auth.supabase as unknown as LooseClient;
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await db.from(table).update({ sort_order: i }).eq("id", orderedIds[i]);
    if (error) return { ok: false, error: friendlyDbError(error) };
  }
  revalidatePublic();
  return { ok: true };
}

export async function setVisible(
  table: ContentTable,
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!valid(table)) return { ok: false, error: BAD_TABLE_ERROR };
  if (table === "posts") return { ok: false, error: NO_ORDER_ERROR };
  const db = auth.supabase as unknown as LooseClient;
  const { error } = await db.from(table).update({ is_visible: visible }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  revalidatePublic();
  return { ok: true };
}

export async function deleteRow(table: ContentTable, id: string): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!valid(table)) return { ok: false, error: BAD_TABLE_ERROR };
  const db = auth.supabase as unknown as LooseClient;

  // Collect file paths first (the DB cascade removes child rows with the parent).
  const paths: string[] = [];
  const { data: rows, error: readError } = await db.from(table).select("*").eq("id", id);
  if (readError) return { ok: false, error: friendlyDbError(readError) };
  for (const r of rows ?? []) paths.push(...collectStoragePaths(r, STORAGE_COLUMNS[table]));
  const child = CHILDREN[table];
  if (child) {
    const { data: kids, error } = await db.from(child.table).select("*").eq(child.fk, id);
    if (error) return { ok: false, error: friendlyDbError(error) };
    for (const r of kids ?? []) paths.push(...collectStoragePaths(r, STORAGE_COLUMNS[child.table]));
  }

  const { error } = await db.from(table).delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  // Row is gone; remove files best-effort. A storage failure never blocks the delete.
  const unique = [...new Set(paths)];
  if (unique.length > 0) {
    const { error: rmError } = await auth.supabase.storage.from("media").remove(unique);
    if (rmError) console.error("storage cleanup failed", table, id, rmError.message);
  }
  revalidatePublic();
  return { ok: true };
}
