type LoaderProps = {
  className?: string;
  label?: string;
};

export function StampLoader({ className = "size-4", label }: LoaderProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      role={label ? "status" : undefined}
      aria-live={label ? "polite" : undefined}
      aria-busy={label ? true : undefined}
    >
      <svg
        className="stamp-spin size-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8" opacity="0.28" />
        <path d="M12 4v3.2M20 12h-3.2M12 20v-3.2M4 12h3.2" />
        <path d="M12 8.2a3.8 3.8 0 1 1-3.8 3.8" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

export function PlateBusy({ label = "Working" }: { label?: string }) {
  return (
    <div
      className="plate-metal relative flex min-h-48 flex-col items-center justify-center gap-3 border border-steel/35 bg-iron px-4 py-10"
      style={{ borderRadius: 8 }}
      aria-busy="true"
      aria-live="polite"
    >
      <StampLoader className="size-8 text-brass" label={label} />
      <p className="stamp text-[12px] text-steel">{label}</p>
    </div>
  );
}

export function PlateSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-9 w-44 border border-steel/30 bg-iron" style={{ borderRadius: 8 }} />
      <PlateBusy />
      <div className="h-28 border border-steel/30 bg-iron" style={{ borderRadius: 8 }} />
    </div>
  );
}
