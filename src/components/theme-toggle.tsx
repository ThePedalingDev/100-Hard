"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("100hard-theme", theme);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") setTheme(current);
  }, []);

  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={`stamp inline-flex min-h-10 items-center gap-2 border border-steel/40 px-3 text-[11px] text-offwhite hover:border-brass ${className}`}
      style={{ borderRadius: 8 }}
      aria-pressed={theme === "light"}
      onClick={() => {
        setTheme(next);
        applyTheme(next);
      }}
    >
      {theme === "dark" ? "Light plate" : "Dark plate"}
    </button>
  );
}
