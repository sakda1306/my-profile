"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { magnetOffset } from "@/lib/fx/motion";

// Pulls its content toward the pointer while the pointer is near it.
export function Magnet({
  padding = 150,
  strength = 3,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
  className = "",
  children,
}: {
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let active = false;
    const move = (e: PointerEvent) => {
      // Measure the untransformed box so the pull does not chase itself.
      const r = el.getBoundingClientRect();
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform === "none" ? undefined : getComputedStyle(el).transform);
      const box = { left: r.left - m.m41, top: r.top - m.m42, width: r.width, height: r.height };
      const o = magnetOffset({ x: e.clientX, y: e.clientY }, box, padding, strength);
      if (o.active !== active) {
        active = o.active;
        el.style.transition = active ? activeTransition : inactiveTransition;
      }
      el.style.transform = `translate3d(${o.x}px, ${o.y}px, 0)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [padding, strength, activeTransition, inactiveTransition]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform", transition: inactiveTransition }}>
      {children}
    </div>
  );
}
