"use client";

import { ChevronRight } from "lucide-react";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";

const PATH_D =
  "M4.43431 2.42415C-0.789139 6.90104 1.21472 15.2022 8.434 15.9242C15.5762 16.6384 18.8649 9.23035 15.9332 4.5183C14.1316 1.62255 8.43695 0.0528911 7.51841 3.33733C6.48107 7.04659 15.2699 15.0195 17.4343 16.9241";

let cachedPathLength = 0;

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

type LoaderSize = "xs" | "sm" | "lg" | number;

function resolveSize(size: LoaderSize): number {
  if (typeof size === "number") return size;
  switch (size) {
    case "xs":
      return 18;
    case "sm":
      return 32;
    case "lg":
    default:
      return 64;
  }
}

interface PathLoaderProps extends React.SVGProps<SVGSVGElement> {
  size?: LoaderSize;
  strokeWidth?: number;
  label?: string;
}

export const PathLoader = forwardRef<SVGSVGElement, PathLoaderProps>(function PathLoader(
  { className, size = "lg", strokeWidth = 2, label, ...props },
  ref,
) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(cachedPathLength);
  const ready = pathLength > 0;
  const pixels = resolveSize(size);

  useLayoutEffect(() => {
    if (!cachedPathLength && pathRef.current) {
      const length = pathRef.current.getTotalLength();
      if (length > 0) {
        cachedPathLength = length;
        setPathLength(length);
      }
    }
  }, []);

  return (
    <svg
      ref={ref}
      role="status"
      aria-label={label ?? "Loading"}
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={pixels}
      height={pixels}
      className={cx("shrink-0 text-current", className)}
      {...props}
    >
      {label ? <title>{label}</title> : null}
      <path
        ref={pathRef}
        d={PATH_D}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={
          ready
            ? ({
                strokeDasharray: pathLength,
                "--path-length": `${pathLength}px`,
              } as React.CSSProperties)
            : undefined
        }
        className={cx(
          "transition-opacity duration-300",
          ready ? "path-loader-stroke opacity-100" : "opacity-0",
        )}
      />
    </svg>
  );
});

export function LoadingLabel({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "loader-shimmer text-[15px] font-medium tracking-wide",
        className,
      )}
    >
      {text}
    </span>
  );
}

export function LoadingBreadcrumb({
  text = "Cooking",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cx("flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <PathLoader
        size="xs"
        strokeWidth={2.5}
        className="text-steel"
        aria-hidden
      />
      <LoadingLabel text={text} />
      <ChevronRight size={16} className="text-steel" aria-hidden />
    </div>
  );
}

export function RippleLoader({
  size = "lg",
  label = "Loading",
  className,
}: {
  size?: "xs" | "sm" | "lg";
  label?: string;
  className?: string;
}) {
  return (
    <PathLoader size={size} label={label} className={cx("text-proof", className)} />
  );
}

export function StampLoader({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <PathLoader
      size="xs"
      strokeWidth={2.5}
      label={label ?? "Loading"}
      className={className}
    />
  );
}

export function PlateBusy({ label = "Cooking" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center py-10">
      <LoadingBreadcrumb text={label} />
    </div>
  );
}
