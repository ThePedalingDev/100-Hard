import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}

export function PhotoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M3.8 16.5 9 12.5l3.2 2.6 3-3.4 5 4.8" />
    </svg>
  );
}

export function SpoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 6.5c0-2 1.6-3.5 3.6-3.5S15.2 4.5 15.2 6.5c0 1.5-1 2.6-2.2 3.1V21" />
      <path d="M13 21H11" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="12" rx="1.5" />
      <path d="M8 17v3l4-3h8.5" />
    </svg>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2c1.4-3 4-4.7 7-4.7s5.6 1.7 7 4.7" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

export function CrossIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

export function PendingIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 19s-6.5-4.2-8.2-7.4C2.3 9.2 3.4 6 6.6 6c1.8 0 2.9 1 3.4 2 .5-1 1.6-2 3.4-2 3.2 0 4.3 3.2 2.8 5.6C18.5 14.8 12 19 12 19z" />
    </svg>
  );
}

export function CommentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 6h14v10H8l-3 3z" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="8" y="8" width="11" height="13" rx="1.5" />
      <path d="M16 8V6.5A1.5 1.5 0 0 0 14.5 5h-9A1.5 1.5 0 0 0 4 6.5v13A1.5 1.5 0 0 0 5.5 21H8" />
    </svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h7A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 10 18.5V17" />
      <path d="M4 12h10M11 8.5 14.5 12 11 15.5" />
    </svg>
  );
}
