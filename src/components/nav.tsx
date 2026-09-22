"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, HomeIcon, PhotoIcon, ProfileIcon, SpoonIcon } from "@/components/icons";

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
      className="fixed inset-x-0 bottom-0 z-20 border-t border-steel/30 bg-graphite md:static md:border-t-0 md:border-b"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2 md:justify-start md:gap-1 md:px-0">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1 md:flex-none">
              <Link
                href={item.href}
                className={`stamp flex min-h-14 flex-col items-center justify-center gap-1 px-3 text-[10px] md:min-h-12 md:flex-row md:text-[12px] ${
                  active ? "text-brass" : "text-steel hover:text-offwhite"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
