import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageBack({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="stamp-press inline-flex min-h-11 w-fit items-center gap-1 rounded-plate border border-steel/40 px-3 text-[13px] font-bold tracking-[-0.01em] text-steel hover:border-club hover:text-offwhite md:min-h-12 md:px-4 md:text-[15px]"
    >
      <ChevronLeft className="size-4 shrink-0" aria-hidden />
      {label}
    </Link>
  );
}
