"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const EVENT = "100hard:route-pending";

export function signalRoutePending() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

export function usePlatePending() {
  const [pending, start] = useTransition();
  const [held, setHeld] = useState(false);

  function leave(href: string, router: { push: (href: string) => void; refresh?: () => void }) {
    setHeld(true);
    signalRoutePending();
    router.refresh?.();
    router.push(href);
  }

  return { pending: pending || held, start, leave };
}

export function RouteProgress() {
  const pathname = usePathname();
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setArmed(false);
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    function arm() {
      setArmed(true);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      arm();
    }

    window.addEventListener(EVENT, arm);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener(EVENT, arm);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useEffect(() => {
    if (!armed) {
      setVisible(false);
      return;
    }
    const show = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(show);
  }, [armed]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-club/10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="route-progress-bar block h-full bg-signal" />
      <span className="sr-only">Working</span>
    </div>
  );
}
