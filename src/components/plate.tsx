import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { StampLoader } from "@/components/loader";
import { scrollFieldIntoView } from "@/lib/mobile-focus";

type PlateTone = "iron" | "club" | "well";

type PlateProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
  id?: string;
  plaque?: boolean;
  tone?: PlateTone;
};

const plateTone: Record<PlateTone, string> = {
  iron: "plate-metal bg-iron",
  club: "plate-club",
  well: "plate-well",
};

export function PageHeader({
  title,
  kicker,
  action,
}: {
  title: string;
  kicker?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-[36px] leading-none">{title}</h1>
        {kicker ? <div className="mt-2 text-sm leading-6 text-steel">{kicker}</div> : null}
      </div>
      {action ? <div className="w-full shrink-0 md:w-auto">{action}</div> : null}
    </header>
  );
}

export function Plate({
  children,
  className = "",
  as: Tag = "section",
  id,
  plaque = false,
  tone = "iron",
}: PlateProps) {
  return (
    <Tag
      id={id}
      className={`relative rounded-plate border px-5 py-5 md:px-6 md:py-6 ${plateTone[tone]} ${className}`}
    >
      {plaque ? (
        <>
          <Rivet className="left-2 top-2" />
          <Rivet className="right-2 top-2" />
          <Rivet className="bottom-2 left-2" />
          <Rivet className="bottom-2 right-2" />
        </>
      ) : null}
      <div className="relative">{children}</div>
    </Tag>
  );
}

function Rivet({ className }: { className: string }) {
  return (
    <span className={`pointer-events-none absolute size-3 ${className}`} aria-hidden="true">
      <span className="absolute inset-0 rounded-full border border-brass bg-club" />
      <span className="absolute inset-[3px] rounded-full bg-brass" />
    </span>
  );
}

export function StatusMark({
  status,
  compact = false,
}: {
  status: "perfect" | "failed" | "pending" | "complete" | "incomplete";
  compact?: boolean;
}) {
  const word =
    status === "perfect"
      ? "Perfect"
      : status === "complete"
        ? "Done"
        : status === "failed"
          ? "Failed"
          : status === "incomplete"
            ? "Missed"
            : "Pending";
  const mark = status === "perfect" || status === "complete" ? "✓" : status === "failed" || status === "incomplete" ? "✕" : "○";
  const tone =
    status === "perfect" || status === "complete"
      ? "text-success"
      : status === "failed" || status === "incomplete"
        ? "text-failure"
        : "text-steel";

  const chip =
    status === "perfect" || status === "complete"
      ? "bg-success/12"
      : status === "failed" || status === "incomplete"
        ? "bg-failure/12"
        : "bg-graphite";

  return (
    <span className={`inline-flex items-center gap-1 rounded-plate px-2 py-1 ${tone} ${chip}`}>
      <span aria-hidden="true">{mark}</span>
      <span className={compact ? "sr-only" : "stamp text-[11px]"}>{word}</span>
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2" htmlFor={htmlFor}>
      <span className="stamp text-[11px] text-steel">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ className = "", onFocus, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      onFocus={(event) => {
        scrollFieldIntoView(event.currentTarget);
        onFocus?.(event);
      }}
      className={`min-h-12 w-full rounded-plate border border-steel/40 bg-graphite px-4 py-3 text-[16px] text-offwhite placeholder:text-steel ${className}`}
    />
  );
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className = "", onFocus, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        onFocus={(event) => {
          scrollFieldIntoView(event.currentTarget);
          onFocus?.(event);
        }}
        className={`min-h-12 w-full rounded-plate border border-steel/40 bg-graphite px-4 py-3 text-[16px] text-offwhite placeholder:text-steel ${className}`}
      />
    );
  },
);

export function Button({
  children,
  variant = "primary",
  size = "default",
  pending = false,
  disabled,
  className = "",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "secondary" | "danger";
  size?: "default" | "compact";
  pending?: boolean;
}) {
  const styles = {
    primary: "bg-brass text-onproof hover:bg-actionhover hover:text-onactionhover",
    ghost: "border border-steel/50 bg-transparent text-offwhite hover:border-club",
    secondary:
      "border border-steel/40 bg-well text-ink hover:border-club hover:bg-graphite/60",
    danger: "border border-failure/70 bg-transparent text-failure hover:bg-failure hover:text-canvas",
  } as const;
  const sizes = {
    default: "min-h-12 px-5 text-[15px] tracking-[-0.01em]",
    compact: "min-h-11 px-4 text-[13px] stamp",
  } as const;
  const busy = pending || Boolean(disabled);

  return (
    <button
      {...props}
      disabled={busy}
      aria-busy={pending || undefined}
      aria-live={pending ? "polite" : undefined}
      onClick={(event) => {
        if (busy) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={`stamp-press inline-flex items-center justify-center gap-2 rounded-plate font-bold disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${styles[variant]} ${className}`}
    >
      {pending ? <StampLoader /> : null}
      {children}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-plate border border-failure/50 bg-failure/10 px-3 py-2 text-sm leading-6 text-offwhite"
    >
      {message}
    </p>
  );
}
