"use client";

import { useSmoothAnchorScroll } from "@/hooks/useSmoothAnchorScroll";

/** Mounts page-wide, non-visual behavior (eased anchor scrolling). */
export default function PageEffects() {
  useSmoothAnchorScroll();
  return null;
}
