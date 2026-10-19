import { beforeEach, describe, expect, it, vi } from "vitest";

const remove = vi.fn();
const deleteSelect = vi.fn();
const supabase = {
  from: () => ({
    select: () => ({
      eq: () =>
        Promise.resolve({
          data: [{ id: "c1", file_path: "certificates/11111111-1111-1111-1111-111111111111.pdf" }],
          error: null,
        }),
    }),
    delete: () => ({ eq: () => ({ select: deleteSelect }) }),
  }),
  storage: { from: () => ({ remove }) },
};

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdminAction: vi.fn(async () => ({ supabase, userId: "u1" })),
}));
vi.mock("@/lib/content/revalidate", () => ({ revalidatePublic: vi.fn() }));

import { deleteRow } from "@/app/admin/actions/crud";

describe("deleteRow", () => {
  beforeEach(() => {
    remove.mockReset().mockResolvedValue({ error: null });
    deleteSelect.mockReset();
  });

  it("returns an error and keeps files when RLS deleted nothing", async () => {
    deleteSelect.mockResolvedValue({ data: [], error: null });
    const res = await deleteRow("certificates", "c1");
    expect(res).toEqual({ ok: false, error: "ไม่พบรายการ" });
    expect(remove).not.toHaveBeenCalled();
  });

  it("removes files after a real delete", async () => {
    deleteSelect.mockResolvedValue({ data: [{ id: "c1" }], error: null });
    const res = await deleteRow("certificates", "c1");
    expect(res).toEqual({ ok: true });
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
