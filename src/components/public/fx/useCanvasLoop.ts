"use client";

import { useEffect, useRef } from "react";

export type LoopApi = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  reducedMotion: boolean;
  /** Reads a CSS custom property (a design token) from the document root. */
  token: (name: string) => string;
};

export type LoopHandlers = {
  /** Called on mount and on every resize; (re)build particles here. */
  setup: (api: LoopApi) => void;
  /** Draws one frame. With reduced motion it runs once and stops. */
  frame: (api: LoopApi) => void;
};

// Sizes the canvas to its box (capped DPR), runs frames only while visible on screen and in a
// visible tab, and draws a single still frame when the user prefers reduced motion.
export function useCanvasLoop(handlers: LoopHandlers) {
  const ref = useRef<HTMLCanvasElement>(null);
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rootStyle = getComputedStyle(document.documentElement);
    const api: LoopApi = {
      ctx,
      width: 0,
      height: 0,
      reducedMotion,
      token: (name) => rootStyle.getPropertyValue(name),
    };
    let raf = 0;
    let onScreen = true;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      api.width = canvas.clientWidth;
      api.height = canvas.clientHeight;
      canvas.width = Math.round(api.width * dpr);
      canvas.height = Math.round(api.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      latest.current.setup(api);
      if (reducedMotion) latest.current.frame(api);
    };
    const tick = () => {
      raf = 0;
      if (!onScreen || document.hidden) return;
      latest.current.frame(api);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!reducedMotion && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
    };

    resize();
    start();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return ref;
}
