"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const APP_PREFIXES = ["/dashboard", "/calendar", "/photos", "/social", "/spoons", "/profile", "/admin"];

export function PageEnter({ children, isolate = false }: { children: ReactNode; isolate?: boolean }) {
  const pathname = usePathname();
  const inApp = APP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (isolate && inApp) return children;
  return (
    <div key={pathname} className="page-surface">
      {children}
    </div>
  );
}
