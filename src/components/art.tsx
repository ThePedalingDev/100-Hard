"use client";

import { useId, type ReactNode } from "react";
import Image from "next/image";

export const ART = {
  spoon: "/art/spoon.webp",
} as const;

export type StampKind = "diet" | "workout" | "water" | "bible";

function Rivet({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="2.2" fill="var(--well)" stroke="var(--proof)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="0.9" fill="var(--proof)" />
    </>
  );
}

function PlateTile({
  size,
  children,
}: {
  size: number;
  children: ReactNode;
}) {
  const raw = useId();
  const hatch = `hatch-${raw.replace(/:/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 5h3M3 1h3" stroke="var(--well)" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="36" height="36" rx="4" fill="var(--iron)" />
      <rect width="36" height="36" rx="4" fill={`url(#${hatch})`} />
      <rect x="0.5" y="0.5" width="35" height="35" rx="4" fill="none" stroke="var(--mute)" strokeOpacity="0.5" />
      <Rivet cx={5} cy={5} />
      <Rivet cx={31} cy={5} />
      <Rivet cx={5} cy={31} />
      <Rivet cx={31} cy={31} />
      {children}
    </svg>
  );
}

export function PlateMark({ size = 48 }: { size?: number }) {
  const raw = useId();
  const hatch = `mark-${raw.replace(/:/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 5h3M3 1h3" stroke="var(--well)" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="48" height="48" rx="8" fill="var(--iron)" />
      <rect width="48" height="48" rx="8" fill={`url(#${hatch})`} />
      <rect x="0.5" y="0.5" width="47" height="47" rx="8" fill="none" stroke="var(--mute)" strokeOpacity="0.5" />
      <Rivet cx={7} cy={7} />
      <Rivet cx={41} cy={7} />
      <Rivet cx={7} cy={41} />
      <Rivet cx={41} cy={41} />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fill="var(--ink)"
        fontFamily="var(--font-barlow), 'Arial Narrow', sans-serif"
        fontSize="16"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        100
      </text>
    </svg>
  );
}

export function CategoryStamp({ kind, size = 28 }: { kind: StampKind; size?: number }) {
  return (
    <PlateTile size={size}>
      <g
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === "diet" ? <DietMark /> : null}
        {kind === "workout" ? <WorkoutMark /> : null}
        {kind === "water" ? <WaterMark /> : null}
        {kind === "bible" ? <BibleMark /> : null}
      </g>
    </PlateTile>
  );
}

function DietMark() {
  return (
    <>
      <rect x="9" y="11" width="18" height="14" rx="1.5" />
      <path d="M20 11v14M20 18h7" />
    </>
  );
}

function WorkoutMark() {
  return (
    <>
      <circle cx="18" cy="18" r="7.5" />
      <circle cx="18" cy="18" r="2.4" />
    </>
  );
}

function WaterMark() {
  return (
    <>
      <path d="M14 14h8v11a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z" />
      <path d="M16 14V12h4v2" />
      <path d="M22 16c2 0 3.5 1.4 3.5 3.2S24 22.4 22 22.4" />
    </>
  );
}

function BibleMark() {
  return (
    <>
      <rect x="11" y="10" width="14" height="16" rx="1" />
      <path d="M14 10v16M14 14h8M14 18h8" />
    </>
  );
}

export function EmptyPlate({ size = 180 }: { size?: number }) {
  return <PlateTile size={size}>{null}</PlateTile>;
}

export function EmptyStill({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children: ReactNode;
}) {
  return (
    <figure>
      <Image
        src={src}
        alt={alt}
        width={1024}
        height={1024}
        className="mx-auto w-full max-w-[220px]"
        style={{ borderRadius: 8 }}
      />
      <figcaption className="mt-3 text-center text-sm text-steel">{children}</figcaption>
    </figure>
  );
}
