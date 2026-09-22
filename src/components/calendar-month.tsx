import Link from "next/link";
import { challengeDayNumber, challengeMilestones } from "@/lib/challenge-dates";
import type { DailyCheckin, Profile } from "@/lib/supabase/types";
import {
  CalendarLegend,
  cellSurface,
  FacePin,
  milestoneCellLabel,
  monthCellClassForMembers,
  peopleForDate,
  pinGapForMembers,
  pinSizeForMembers,
} from "@/components/calendar-shared";

export function CalendarMonth({
  month,
  lead,
  count,
  today,
  start,
  end,
  people,
  rows,
}: {
  month: string;
  lead: number;
  count: number;
  today: string;
  start: string;
  end: string;
  people: Array<{ id: string; profile: Profile; avatarUrl: string | null }>;
  rows: Array<Pick<DailyCheckin, "user_id" | "challenge_date" | "status">>;
}) {
  const milestones = challengeMilestones(start, end);
  const byDate = new Map(milestones.map((item) => [item.iso, item]));
  const prefix = month.slice(0, 7);
  const memberCount = people.length;
  const pinSize = pinSizeForMembers(memberCount, "month");
  const cellClass = monthCellClassForMembers(memberCount);
  const pinGap = pinGapForMembers(memberCount);

  return (
    <div>
      <div className="mb-3 grid grid-cols-7 gap-1 md:gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <p key={day} className="stamp text-center text-[11px] text-steel">
            {day}
          </p>
        ))}
      </div>
      <div className="calendar-month-grid grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: lead }, (_, index) => (
          <div key={`lead-${index}`} />
        ))}
        {Array.from({ length: count }, (_, index) => {
          const iso = `${prefix}-${String(index + 1).padStart(2, "0")}`;
          const inChallenge = iso >= start && iso <= end;
          const milestone = byDate.get(iso);
          const dayPeople = peopleForDate(iso, inChallenge, today, people, rows);
          const dayNumber = inChallenge ? challengeDayNumber(iso, start) : null;
          const surface = inChallenge
            ? cellSurface(dayPeople, iso === today, milestone)
            : "border-steel/15 bg-canvas opacity-45";
          const inner = (
            <>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="stamp tabular text-[11px] leading-none md:text-[13px]">{index + 1}</p>
                {milestone ? (
                  <p
                    className="stamp truncate text-[7px] leading-none text-mark md:text-[9px]"
                    title={milestone.label}
                  >
                    <span className="md:hidden">{milestoneCellLabel(milestone)}</span>
                    <span className="hidden md:inline">{milestone.label}</span>
                  </p>
                ) : null}
              </div>
              {dayNumber ? (
                <p className="sr-only">
                  Challenge day {dayNumber}
                  {milestone ? ` · ${milestone.label}` : ""}
                </p>
              ) : null}
              {inChallenge ? (
                <div className={`mt-auto flex flex-wrap ${pinGap}`}>
                  {dayPeople.map((person) => (
                    <FacePin key={person.id} person={person} size={pinSize} />
                  ))}
                </div>
              ) : null}
            </>
          );

          if (!inChallenge) {
            return (
              <div
                key={iso}
                className={`flex flex-col gap-1 rounded-plate border p-1.5 md:p-2 ${cellClass} ${surface}`}
              >
                {inner}
              </div>
            );
          }

          return (
            <Link
              key={iso}
              href={`/calendar/${iso}`}
              className={`flex flex-col gap-1 rounded-plate border p-1.5 md:p-2 ${cellClass} ${surface}`}
            >
              {inner}
            </Link>
          );
        })}
      </div>
      <CalendarLegend milestones={milestones} />
    </div>
  );
}
