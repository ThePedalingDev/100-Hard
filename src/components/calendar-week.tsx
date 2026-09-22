import Link from "next/link";
import { challengeDayNumber, challengeMilestones } from "@/lib/challenge-dates";
import { formatShortDate } from "@/lib/challenge";
import {
  CalendarLegend,
  cellSurface,
  FacePin,
  peopleForDate,
  pinGapForMembers,
  pinSizeForMembers,
  weekdayName,
  type CalendarPerson,
  type CalendarRow,
} from "@/components/calendar-shared";

export function CalendarWeek({
  dates,
  today,
  start,
  end,
  people,
  rows,
}: {
  dates: string[];
  today: string;
  start: string;
  end: string;
  people: CalendarPerson[];
  rows: CalendarRow[];
}) {
  const milestones = challengeMilestones(start, end);
  const byDate = new Map(milestones.map((item) => [item.iso, item]));
  const memberCount = people.length;
  const pinSize = pinSizeForMembers(memberCount, "week");
  const pinGap = pinGapForMembers(memberCount);
  const rowClass = memberCount <= 2 ? "min-h-20" : memberCount <= 4 ? "min-h-[4.5rem]" : "min-h-16";

  return (
    <div>
      <div className="flex flex-col gap-2">
        {dates.map((iso) => {
          const inChallenge = iso >= start && iso <= end;
          const milestone = byDate.get(iso);
          const dayPeople = peopleForDate(iso, inChallenge, today, people, rows);
          const surface = inChallenge
            ? cellSurface(dayPeople, iso === today, milestone)
            : "border-steel/15 bg-canvas opacity-45";
          const dayNumber = inChallenge ? challengeDayNumber(iso, start) : null;

          const inner = (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex w-14 shrink-0 flex-col">
                  <p className="stamp text-[11px] text-steel">{weekdayName(iso)}</p>
                  <p className="stamp tabular text-lg leading-none">{iso.slice(8, 10)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-offwhite">{formatShortDate(iso)}</p>
                  {milestone ? (
                    <p className="stamp truncate text-[11px] text-mark" title={milestone.label}>
                      {milestone.label}
                    </p>
                  ) : dayNumber ? (
                    <p className="stamp text-[11px] text-steel">Day {dayNumber}</p>
                  ) : null}
                </div>
                {inChallenge ? (
                  <div className={`flex flex-wrap justify-end ${pinGap}`}>
                    {dayPeople.map((person) => (
                      <FacePin key={person.id} person={person} size={pinSize} />
                    ))}
                  </div>
                ) : null}
              </div>
              {dayNumber && milestone ? (
                <p className="sr-only">
                  Challenge day {dayNumber} · {milestone.label}
                </p>
              ) : dayNumber ? (
                <p className="sr-only">Challenge day {dayNumber}</p>
              ) : null}
            </>
          );

          if (!inChallenge) {
            return (
              <div
                key={iso}
                className={`flex items-center rounded-plate border px-3 py-2.5 ${rowClass} ${surface}`}
              >
                {inner}
              </div>
            );
          }

          return (
            <Link
              key={iso}
              href={`/calendar/${iso}`}
              className={`flex items-center rounded-plate border px-3 py-2.5 ${rowClass} ${surface}`}
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
