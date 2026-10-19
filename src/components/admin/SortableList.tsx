"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderRows } from "@/app/admin/actions/crud";
import type { ContentTable } from "@/lib/admin/storage-paths";

type Props<T extends { id: string }> = {
  items: T[];
  table: ContentTable;
  renderItem: (item: T) => ReactNode;
  /** Optional hook after a successful reorder, receives the new id order. */
  onReorder?: (orderedIds: string[]) => void;
};

function Row({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
    >
      <button
        type="button"
        aria-label="ลากเพื่อเรียงลำดับ"
        className="cursor-grab text-muted"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="flex-1">{children}</div>
    </li>
  );
}

export function SortableList<T extends { id: string }>({
  items: initial,
  table,
  renderItem,
  onReorder,
}: Props<T>) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const prev = items;
    const from = prev.findIndex((i) => i.id === active.id);
    const to = prev.findIndex((i) => i.id === over.id);
    const next = arrayMove(prev, from, to);
    setItems(next);
    setError(null);
    const ids = next.map((i) => i.id);
    startTransition(async () => {
      const res = await reorderRows(table, ids);
      if (!res.ok) {
        setItems(prev);
        setError(res.error);
      } else {
        onReorder?.(ids);
      }
    });
  }

  return (
    <div>
      {error ? (
        <p role="alert" className="mb-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map((item) => (
              <Row key={item.id} id={item.id}>
                {renderItem(item)}
              </Row>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
