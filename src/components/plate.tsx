import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { StampLoader } from "@/components/loader";

type PlateProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
  id?: string;
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
    <header className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[36px] leading-none">{title}</h1>
        {kicker ? <div className="mt-2 text-sm leading-6 text-steel">{kicker}</div> : null}
      </div>
      {action}
    </header>
  );
}

export function Plate({ children, className = "", as: Tag = "section", id }: PlateProps) {
  return (
    <Tag
      id={id}
      className={`plate-metal relative rounded-plate border border-steel/45 bg-iron px-5 py-5 md:px-6 md:py-6 ${className}`}
    >
      <Rivet className="left-2 top-2" />
      <Rivet className="right-2 top-2" />
      <Rivet className="bottom-2 left-2" />
      <Rivet className="bottom-2 right-2" />
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

  return (
    <span className={`inline-flex items-center gap-1 ${tone}`}>
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

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-12 w-full rounded-plate border border-steel/40 bg-graphite px-4 py-3 text-[16px] text-offwhite placeholder:text-steel ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-12 w-full rounded-plate border border-steel/40 bg-graphite px-4 py-3 text-[16px] text-offwhite placeholder:text-steel ${props.className ?? ""}`}
    />
  );
}

export function Button({
  children,
  variant = "primary",
  pending = false,
  disabled,
  className = "",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  pending?: boolean;
}) {
  const styles = {
    primary: "bg-brass text-onproof hover:bg-actionhover hover:text-onactionhover",
    ghost: "border border-steel/50 bg-transparent text-offwhite hover:border-club",
    danger: "border border-failure/70 bg-transparent text-failure hover:bg-failure hover:text-canvas",
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
      className={`stamp-press inline-flex min-h-12 items-center justify-center gap-2 rounded-plate px-5 text-[15px] font-bold tracking-[-0.01em] disabled:pointer-events-none disabled:opacity-50 ${styles[variant]} ${className}`}
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
