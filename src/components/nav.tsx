"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, ChatIcon, HomeIcon, PhotoIcon, ProfileIcon, SpoonIcon } from "@/components/icons";
import { RippleLoader } from "@/components/loader";
import { useSocialNotices } from "@/components/social-notices-provider";

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
  const { unreadCount } = useSocialNotices();

  return (
    <nav aria-label="Challenge" className="tabbar">
      <ul className="mx-auto flex w-full items-stretch justify-between gap-1 px-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                prefetch
                className={`relative flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[11px] font-bold tracking-[-0.01em] md:min-h-11 md:flex-row md:gap-2 md:rounded-plate md:px-4 md:py-2 md:text-[13px] md:hover:bg-graphite/70 ${
                  active ? "text-mark md:bg-graphite/50" : "text-steel hover:text-offwhite"
                }`}
              >
                <span className="relative inline-flex size-5 shrink-0 items-center justify-center overflow-visible">
                  <Icon className="size-5" />
                  {item.href === "/social" && unreadCount > 0 ? (
                    <span className="nav-notice-pill" aria-label={`${unreadCount} new social updates`}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                  <NavPendingHint />
                </span>
                <span className="truncate">{item.label}</span>
                <span
                  className={`nav-underline absolute inset-x-2 bottom-0.5 h-0.5 origin-center bg-brass md:inset-x-3 md:bottom-1.5 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                  aria-hidden="true"
                />
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
      <RippleLoader size="xs" label="Loading" />
    </span>
  );
}
