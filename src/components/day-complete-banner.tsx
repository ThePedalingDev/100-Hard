"use client";

import { useEffect, useRef, useState } from "react";
import { StatusMark } from "@/components/plate";

export function DayCompleteBanner({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);
  const [stamping, setStamping] = useState(false);
  const previous = useRef(active);

  useEffect(() => {
    if (active && !previous.current) {
      setVisible(true);
      setStamping(true);
    }
    previous.current = active;
  }, [active]);

  if (!visible) return null;

  return (
    <div
      className="day-complete-banner mb-4 rounded-plate border border-success/45 bg-success/12 px-4 py-4"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span
          className={stamping ? "stamp-mark is-stamping" : "stamp-mark"}
          onAnimationEnd={() => setStamping(false)}
        >
          <StatusMark status="perfect" compact />
        </span>
        <div className="min-w-0 flex-1">
          <p className="stamp text-[11px] text-success">Plate stamped</p>
          <p className="mt-1 text-[18px] leading-tight">Your day is complete</p>
          <p className="mt-1 text-sm text-steel">All four categories are checked. Hold the line until midnight.</p>
        </div>
        <button
          type="button"
          className="tap-target stamp shrink-0 text-[11px] text-steel hover:text-offwhite"
          onClick={() => setVisible(false)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
