"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { HistoryDay } from "@/components/history-day";
import { Plate, StatusMark } from "@/components/plate";
import { formatStampDate } from "@/lib/challenge";
import { challengeDayNumber } from "@/lib/challenge-dates";
import { checkinDisplayStatus, completedCategories } from "@/lib/scoring";
import type { DailyCheckin } from "@/lib/supabase/types";

export function HistoryTimeline({
  start,
  today,
  dates,
  checkins,
  focusDate,
}: {
  start: string;
  today: string;
  dates: string[];
  checkins: Map<string, DailyCheckin>;
  focusDate?: string;
}) {
  const focusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!focusDate || !focusRef.current) return;
    focusRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusDate]);

  return (
    <ol className="history-timeline flex flex-col gap-4">
      {dates.map((date) => {
        const checkin = checkins.get(date);
        const dayNumber = challengeDayNumber(date, start);
        const focused = focusDate === date;
        const complete = checkin ? completedCategories(checkin) : 0;
        const status = checkin
          ? checkinDisplayStatus(checkin)
          : date < today
            ? "failed"
            : "pending";

        return (
          <li
            key={date}
            id={`history-${date}`}
            ref={focused ? focusRef : undefined}
            className={`history-timeline-day${focused ? " is-focused" : ""}`}
          >
            <div className="history-timeline-head mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="stamp text-[11px] text-steel">Day {dayNumber}</p>
                <h2 className="mt-1 text-[18px] leading-none">{formatStampDate(date)}</h2>
              </div>
              <div className="flex items-center gap-3">
                {checkin ? (
                  <p className="stamp tabular text-[11px] text-steel">{complete} / 4</p>
                ) : null}
                <StatusMark status={status} />
                <Link
                  href={`/calendar/${date}`}
                  className="stamp-press stamp inline-flex min-h-11 items-center rounded-plate border border-steel/40 px-3 text-[11px] text-steel hover:border-club hover:text-offwhite"
                >
                  Calendar
                </Link>
              </div>
            </div>
            {checkin ? (
              <HistoryDay checkin={checkin} />
            ) : (
              <Plate>
                <p className="text-sm leading-6 text-steel">
                  {date < today
                    ? "No inspection recorded for this day."
                    : "This day is still open on the dashboard."}
                </p>
              </Plate>
            )}
          </li>
        );
      })}
    </ol>
  );
}
