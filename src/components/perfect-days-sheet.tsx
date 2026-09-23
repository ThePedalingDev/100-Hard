"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRef } from "react";
import { formatStampDate } from "@/lib/challenge";

export type PerfectDayEntry = {
  date: string;
  dayNumber: number;
};

export function PerfectDaysStat({
  count,
  days,
}: {
  count: number;
  days: PerfectDayEntry[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="stamp-press group min-h-11 w-full rounded-plate text-left transition-colors hover:bg-graphite/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-proof"
        aria-haspopup="dialog"
      >
        <p className="stamp flex items-center gap-1 text-[32px] leading-none tabular text-success">
          {count}
          <ChevronRight
            className="size-4 translate-y-px text-steel transition-transform group-hover:translate-x-0.5 group-hover:text-offwhite"
            aria-hidden
          />
        </p>
        <p className="stamp mt-2 text-[11px] text-steel">Perfect days</p>
      </button>

      <dialog ref={dialogRef} className="perfect-days-dialog" onClose={close}>
        <PerfectDaysPanel count={count} days={days} onClose={close} />
      </dialog>
    </>
  );
}

function PerfectDaysPanel({
  count,
  days,
  onClose,
}: {
  count: number;
  days: PerfectDayEntry[];
  onClose: () => void;
}) {
  return (
    <div className="perfect-days-panel">
      <header className="flex items-start justify-between gap-3 border-b border-steel/25 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-[18px] leading-none">Perfect days</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            {count === 0
              ? "Stamp every requirement on a day to land here."
              : `${count} day${count === 1 ? "" : "s"} with a full inspection.`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="stamp-press inline-flex min-h-11 min-w-11 items-center justify-center rounded-plate border border-steel/40 px-3 text-[13px] font-bold text-steel hover:border-club hover:text-offwhite"
        >
          Close
        </button>
      </header>

      {days.length === 0 ? (
        <div className="px-4 py-8 sm:px-5">
          <p className="text-sm leading-6 text-steel">
            No perfect days yet. Complete diet, workout, water, and bible on the same day to earn one.
          </p>
        </div>
      ) : (
        <ol className="max-h-[min(60vh,28rem)] divide-y divide-steel/20 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3">
          {days.map((day) => (
            <li key={day.date}>
              <Link
                href={`/profile/history?date=${day.date}`}
                onClick={onClose}
                className="stamp-press flex min-h-11 items-center gap-3 rounded-plate px-2 py-3 hover:bg-graphite/50 sm:px-3"
              >
                <span className="stamp grid size-10 shrink-0 place-items-center rounded-plate border border-success/35 bg-success/10 text-[11px] font-bold tabular text-success">
                  {day.dayNumber}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-none tracking-[-0.03em]">
                    Day {day.dayNumber}
                  </span>
                  <span className="mt-1 block text-sm text-steel">{formatStampDate(day.date)}</span>
                </span>
                <span className="stamp shrink-0 text-[11px] text-success">Perfect</span>
                <ChevronRight className="size-4 shrink-0 text-steel" aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
