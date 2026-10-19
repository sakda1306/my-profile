"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type Tag = "div" | "section" | "p" | "h1" | "h2" | "h3" | "span" | "li" | "ul" | "nav" | "header";

const tags = {
  div: motion.div,
  section: motion.section,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  span: motion.span,
  li: motion.li,
  ul: motion.ul,
  nav: motion.nav,
  header: motion.header,
};

// Fades and slides its content in the first time it scrolls into view.
// The server markup never depends on reduced motion (that would break hydration); it only drops the animation time.
export function FadeIn({
  as = "div",
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  style,
  children,
}: {
  as?: Tag;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const M = tags[as];
  return (
    <M
      data-fade=""
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={reduce ? { duration: 0 } : { duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </M>
  );
}
