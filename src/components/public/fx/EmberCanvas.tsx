"use client";

import { useEffect, useRef } from "react";
import {
  emberAlpha,
  parseColor,
  particleCount,
  rgba,
  spawnEmber,
  stepEmber,
  type Ember,
  type Pointer,
} from "@/lib/fx/particles";
import { useCanvasLoop } from "./useCanvasLoop";

const BASE_COUNT = 110;

// Glowing embers rising through the parent box; the pointer pushes them aside.
export function EmberCanvas({ className = "" }: { className?: string }) {
  const embers = useRef<Ember[]>([]);
  const pointer = useRef<Pointer>(null);
  const colors = useRef({ ember: { r: 255, g: 138, b: 43 }, hot: { r: 255, g: 210, b: 122 } });

  const ref = useCanvasLoop({
    setup: (api) => {
      colors.current = {
        ember: parseColor(api.token("--color-ember"), colors.current.ember),
        hot: parseColor(api.token("--color-ember-hot"), colors.current.hot),
      };
      const n = particleCount(BASE_COUNT, api.width, api.reducedMotion);
      embers.current = Array.from({ length: n }, () => spawnEmber(api.width, api.height, Math.random, true));
    },
    frame: ({ ctx, width, height, reducedMotion }) => {
      const { ember, hot } = colors.current;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      const list = embers.current;
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        if (!reducedMotion && !stepEmber(p, pointer.current)) {
          list[i] = spawnEmber(width, height, Math.random, false);
          continue;
        }
        const a = reducedMotion ? 0.7 : emberAlpha(p);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        glow.addColorStop(0, rgba(hot, a));
        glow.addColorStop(0.25, rgba(ember, a * 0.8));
        glow.addColorStop(1, rgba(ember, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
        if (p.streak && !reducedMotion) {
          ctx.strokeStyle = rgba(ember, a * 0.6);
          ctx.lineWidth = p.r * 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 10, p.y - p.vy * 10);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    },
  });

  // The canvas ignores pointer events, so listen on its parent (the poster).
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const move = (e: PointerEvent) => {
      const b = host.getBoundingClientRect();
      pointer.current = { x: e.clientX - b.left, y: e.clientY - b.top };
    };
    const leave = () => {
      pointer.current = null;
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [ref]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
