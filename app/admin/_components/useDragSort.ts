"use client";

import { useRef, useState } from "react";

/**
 * Shared drag-and-drop + touch sort hook for admin list reordering.
 * Spread getItemProps(i) on each sortable element.
 * Add data-sort-idx={i} so touch events can identify the target.
 */
export function useDragSort(onReorder: (from: number, to: number) => void) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const touchFrom = useRef<number | null>(null);
  const touchOver = useRef<number | null>(null);

  function commit(from: number, to: number) {
    if (from !== to) onReorder(from, to);
    setDragIdx(null);
    setOverIdx(null);
  }

  function getItemProps(i: number) {
    return {
      "data-sort-idx": String(i),
      draggable: true as const,
      style: { touchAction: "none" as const },

      // ── Mouse / pointer drag ──────────────────────────────────────
      onDragStart: () => setDragIdx(i),
      onDragOver:  (e: React.DragEvent) => { e.preventDefault(); setOverIdx(i); },
      onDrop:      () => { if (dragIdx !== null) commit(dragIdx, i); },
      onDragEnd:   () => { setDragIdx(null); setOverIdx(null); },

      // ── Touch drag ───────────────────────────────────────────────
      onTouchStart: () => {
        touchFrom.current = i;
        touchOver.current = i;
        setDragIdx(i);
      },
      onTouchMove: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const target = el?.closest("[data-sort-idx]");
        if (target) {
          const idx = parseInt(target.getAttribute("data-sort-idx") ?? "-1", 10);
          if (idx >= 0 && idx !== touchOver.current) {
            touchOver.current = idx;
            setOverIdx(idx);
          }
        }
      },
      onTouchEnd: () => {
        if (touchFrom.current !== null && touchOver.current !== null) {
          commit(touchFrom.current, touchOver.current);
        }
        touchFrom.current = null;
        touchOver.current = null;
      },
    };
  }

  return { dragIdx, overIdx, getItemProps };
}
