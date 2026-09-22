"use client";

import { useEffect } from "react";

let shellHeight = 0;

function syncVisualViewport() {
  const root = document.documentElement;
  const viewport = window.visualViewport;

  if (!viewport) {
    root.style.removeProperty("--vv-height");
    root.style.removeProperty("--vv-shell-height");
    root.style.removeProperty("--vv-offset-top");
    root.classList.remove("vv-keyboard");
    shellHeight = 0;
    return;
  }

  const keyboard = viewport.height < window.innerHeight * 0.75;

  root.classList.toggle("vv-keyboard", keyboard);
  root.style.setProperty("--vv-offset-top", `${Math.round(viewport.offsetTop)}px`);

  if (!keyboard) {
    shellHeight = Math.round(viewport.height);
    root.style.setProperty("--vv-height", `${shellHeight}px`);
    root.style.setProperty("--vv-shell-height", `${shellHeight}px`);
    return;
  }

  const frozen = shellHeight || Math.round(window.innerHeight);
  root.style.setProperty("--vv-height", `${frozen}px`);
  root.style.setProperty("--vv-shell-height", `${frozen}px`);
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
