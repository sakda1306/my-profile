"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { stackScale } from "@/lib/fx/motion";

// A sticky card that shrinks toward its target scale while the cards after it scroll over it.
export function StackedCard({ index, total, children }: { index: number; total: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, stackScale(index, total)]);

  return (
    <div ref={ref} className="h-[85vh]">
      <motion.div
        className="sticky origin-top"
        style={{ top: `calc(var(--stack-top) + ${index * 28}px)`, scale: reduce ? 1 : scale }}
      >
        {children}
      </motion.div>
    </div>
  );
}
