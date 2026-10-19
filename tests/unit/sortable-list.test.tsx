// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/actions/crud", () => ({ reorderRows: vi.fn() }));

import { SortableList } from "@/components/admin/SortableList";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Item = { id: string; name: string };

function render(root: ReturnType<typeof createRoot>, items: Item[]) {
  act(() => {
    root.render(
      createElement(SortableList<Item>, {
        items,
        table: "skills",
        renderItem: (i) => createElement("span", null, i.name),
      }),
    );
  });
}

describe("SortableList", () => {
  it("shows refreshed props after add, edit and delete", () => {
    const el = document.createElement("div");
    const names = () => [...el.querySelectorAll("li span")].map((n) => n.textContent).join("");
    document.body.appendChild(el);
    const root = createRoot(el);
    render(root, [{ id: "a", name: "A" }, { id: "b", name: "B" }]);
    expect(names()).toBe("AB");
    render(root, [{ id: "a", name: "A2" }, { id: "b", name: "B" }, { id: "c", name: "C" }]);
    expect(names()).toBe("A2BC");
    render(root, [{ id: "b", name: "B" }]);
    expect(names()).toBe("B");
    act(() => root.unmount());
  });
});
