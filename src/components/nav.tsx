"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CalendarIcon, ChatIcon, HomeIcon, PhotoIcon, ProfileIcon, SpoonIcon } from "@/components/icons";
import { StampLoader } from "@/components/loader";

const items = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/photos", label: "Photos", icon: PhotoIcon },
  { href: "/social", label: "Social", icon: ChatIcon },
  { href: "/spoons", label: "Spoons", icon: SpoonIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
];

export function AppNav() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    function sync() {
      const height = viewport?.height ?? window.innerHeight;
      root.style.setProperty("--vv-height", `${Math.round(height)}px`);
    }
    sync();
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      window.removeEventListener("orientationchange", sync);
      root.style.removeProperty("--vv-height");
    };
  }, []);

  return (
    <nav aria-label="Challenge" className="tabbar">
      <ul className="mx-auto flex w-full items-stretch justify-between px-1 md:px-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-bold tracking-[-0.01em] md:min-h-12 md:flex-row md:gap-2 md:text-[13px] ${
                  active ? "text-brass" : "text-steel hover:text-offwhite"
                }`}
              >
                <span className="relative inline-flex size-5 items-center justify-center">
                  <Icon className="size-5" />
                  <NavPendingHint />
                </span>
                {item.label}
                {active ? (
                  <span className="absolute inset-x-2 bottom-1 h-0.5 bg-brass md:bottom-2" aria-hidden="true" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavPendingHint() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span className="absolute inset-0 grid place-items-center bg-canvas md:bg-iron" aria-hidden="true">
      <StampLoader className="size-4 text-brass" />
    </span>
  );
}
