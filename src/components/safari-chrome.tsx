"use client";

import { useEffect } from "react";

function syncVisualViewport() {
  const root = document.documentElement;
  const viewport = window.visualViewport;

  if (!viewport) {
    root.style.removeProperty("--vv-height");
    root.style.removeProperty("--vv-offset-top");
    root.classList.remove("vv-keyboard");
    return;
  }

  const height = Math.round(viewport.height);
  const offsetTop = Math.round(viewport.offsetTop);
  const keyboard = height < window.innerHeight * 0.75;

  root.style.setProperty("--vv-height", `${height}px`);
  root.style.setProperty("--vv-offset-top", `${offsetTop}px`);
  root.classList.toggle("vv-keyboard", keyboard);
}

export function SafariChrome() {
  useEffect(() => {
    syncVisualViewport();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", syncVisualViewport);
    viewport?.addEventListener("scroll", syncVisualViewport);
    window.addEventListener("orientationchange", syncVisualViewport);
    window.addEventListener("resize", syncVisualViewport);
    return () => {
      viewport?.removeEventListener("resize", syncVisualViewport);
      viewport?.removeEventListener("scroll", syncVisualViewport);
      window.removeEventListener("orientationchange", syncVisualViewport);
      window.removeEventListener("resize", syncVisualViewport);
    };
  }, []);

  return null;
}
