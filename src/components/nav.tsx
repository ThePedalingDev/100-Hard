"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, HomeIcon, PhotoIcon, ProfileIcon, SpoonIcon } from "@/components/icons";
import { StampLoader } from "@/components/loader";

const items = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/photos", label: "Photos", icon: PhotoIcon },
  { href: "/spoons", label: "Spoons", icon: SpoonIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Challenge"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-steel/30 bg-graphite md:static md:mb-6 md:border-t-0 md:border-b"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2 md:justify-start md:gap-1 md:px-0">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1 md:flex-none">
              <Link
                href={item.href}
                className={`stamp flex min-h-14 flex-col items-center justify-center gap-1 px-3 text-[11px] md:min-h-12 md:flex-row ${
                  active ? "text-brass" : "text-steel hover:text-offwhite"
                }`}
              >
                <span className="relative inline-flex size-5 items-center justify-center">
                  <Icon className="size-5" />
                  <NavPendingHint />
                </span>
                {item.label}
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
    <span className="absolute inset-0 grid place-items-center bg-graphite" aria-hidden="true">
      <StampLoader className="size-4 text-brass" />
    </span>
  );
}
