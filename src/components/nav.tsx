"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
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
] as const;

type NavItem = (typeof items)[number];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ challengeName }: { challengeName?: string | null }) {
  const pathname = usePathname();
  const { unreadCount } = useSocialNotices();
  const railRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const activeHref = items.find((item) => isActive(pathname, item.href))?.href ?? items[0].href;

  const syncIndicator = useCallback(() => {
    const rail = railRef.current;
    const link = itemRefs.current.get(activeHref);
    if (!rail || !link) return;
    const railBox = rail.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    setIndicator({
      left: linkBox.left - railBox.left + rail.scrollLeft,
      width: linkBox.width,
    });
  }, [activeHref]);

  useLayoutEffect(() => {
    syncIndicator();
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncIndicator);
      return () => window.removeEventListener("resize", syncIndicator);
    }
    const observer = new ResizeObserver(() => syncIndicator());
    observer.observe(rail);
    window.addEventListener("resize", syncIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncIndicator);
    };
  }, [syncIndicator]);

  return (
    <nav aria-label="Challenge" className="tabbar">
      <div className="tabbar-brand">
        <p className="tabbar-brand-title">100 Hard</p>
        {challengeName && challengeName !== "100 Hard" ? (
          <p className="tabbar-brand-kicker">{challengeName}</p>
        ) : null}
      </div>
      <ul ref={railRef} className="tabbar-rail">
        {indicator ? (
          <span
            className="tabbar-indicator"
            aria-hidden="true"
            style={{
              width: indicator.width,
              transform: `translateX(${indicator.left}px)`,
            }}
          />
        ) : null}
        {items.map((item, index) => (
          <NavItemLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            index={index}
            unreadCount={item.href === "/social" ? unreadCount : 0}
            register={(node) => {
              if (node) itemRefs.current.set(item.href, node);
              else itemRefs.current.delete(item.href);
            }}
          />
        ))}
      </ul>
    </nav>
  );
}

function NavItemLink({
  item,
  active,
  index,
  unreadCount,
  register,
}: {
  item: NavItem;
  active: boolean;
  index: number;
  unreadCount: number;
  register: (node: HTMLAnchorElement | null) => void;
}) {
  const Icon = item.icon;

  return (
    <li className="tabbar-item" style={{ "--nav-index": index } as CSSProperties}>
      <Link
        ref={register}
        href={item.href}
        prefetch
        aria-current={active ? "page" : undefined}
        className={`tabbar-link${active ? " is-active" : ""}`}
      >
        <span className="tabbar-icon">
          <Icon className="tabbar-icon-svg" />
          {unreadCount > 0 ? (
            <span className="nav-notice-pill" aria-label={`${unreadCount} new social updates`}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
          <NavPendingHint />
        </span>
        <span className="tabbar-label">{item.label}</span>
        <span className="tabbar-mobile-mark" aria-hidden="true" />
      </Link>
    </li>
  );
}

function NavPendingHint() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span className="tabbar-pending" aria-hidden="true">
      <RippleLoader size="xs" label="Loading" />
    </span>
  );
}
