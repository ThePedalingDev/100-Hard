"use client";

import { useEffect } from "react";

function isIOS() {
  const ua = navigator.userAgent;
  if (/iP(hone|od|ad)/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function applySafariChrome() {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  const inner = window.innerHeight;
  const visualBottom = viewport ? viewport.offsetTop + viewport.height : inner;
  const measured = Math.max(0, Math.round(inner - visualBottom));
  const keyboard = viewport ? viewport.height < inner * 0.66 : false;
  const overlay =
    !keyboard && measured < 24 && isIOS() && !isStandalone() && window.matchMedia("(max-width: 767px)").matches;

  root.style.setProperty("--vv-height", `${Math.round(viewport?.height ?? inner)}px`);
  root.style.setProperty("--safari-chrome", `${keyboard ? 0 : overlay ? 80 : measured}px`);
}

export function SafariChrome() {
  useEffect(() => {
    applySafariChrome();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", applySafariChrome);
    viewport?.addEventListener("scroll", applySafariChrome);
    window.addEventListener("orientationchange", applySafariChrome);
    window.addEventListener("resize", applySafariChrome);
    return () => {
      viewport?.removeEventListener("resize", applySafariChrome);
      viewport?.removeEventListener("scroll", applySafariChrome);
      window.removeEventListener("orientationchange", applySafariChrome);
      window.removeEventListener("resize", applySafariChrome);
    };
  }, []);

  return null;
}
