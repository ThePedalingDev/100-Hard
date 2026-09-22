"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { LoadingBreadcrumb } from "@/components/loader";

const EVENT = "100hard:route-pending";
const FADE_MS = 340;
const MIN_VISIBLE_MS = 360;

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

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
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const shownAtRef = useRef(0);
  const pathnameRef = useRef(pathname);
  const armedPathRef = useRef(pathname);
  const exitTimersRef = useRef<number[]>([]);

  pathnameRef.current = pathname;

  function clearExitTimers() {
    for (const timer of exitTimersRef.current) {
      window.clearTimeout(timer);
    }
    exitTimersRef.current = [];
  }

  function scheduleExit() {
    clearExitTimers();

    const elapsed = Date.now() - shownAtRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    const startFade = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setActive(false);

          const unmount = window.setTimeout(() => {
            setMounted(false);
            clearExitTimers();
          }, FADE_MS);

          exitTimersRef.current.push(unmount);
        });
      });
    }, wait);

    exitTimersRef.current.push(startFade);
  }

  useEffect(() => {
    function arm() {
      clearExitTimers();
      armedPathRef.current = pathnameRef.current;
      shownAtRef.current = Date.now();
      setMounted(true);
      setActive(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true));
      });
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
    if (!mounted) return;
    if (pathname === armedPathRef.current) return;
    scheduleExit();
    return clearExitTimers;
  }, [pathname, mounted]);

  useEffect(() => () => clearExitTimers(), []);

  if (!mounted) return null;

  return (
    <div
      className={cx(
        "route-progress-overlay fixed inset-0 z-50 grid place-items-center bg-canvas/72",
        active && "is-active",
      )}
      role="status"
      aria-live="polite"
      aria-busy={active}
    >
      <LoadingBreadcrumb text="Cooking" className="route-progress-panel" />
    </div>
  );
}
