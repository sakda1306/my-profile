"use client";

import { useEffect } from "react";

// Marks <html data-hydrated> once React is running, which turns off the CSS fallback
// that reveals [data-fade] content when the scripts never load.
export function HydrationFlag() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "";
  }, []);
  return null;
}
