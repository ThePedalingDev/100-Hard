import Link from "next/link";
import {
  challengeDayNumber,
  challengeMilestones,
  type ChallengeMilestone,
} from "@/lib/challenge-dates";
import type { DailyCheckin, Profile } from "@/lib/supabase/types";

type PersonStatus = {
  id: string;
  name: string;
  status: "perfect" | "failed" | "pending";
};

function markFor(status: PersonStatus["status"]) {
  if (status === "perfect") return { glyph: "✓", word: "Perfect", className: "bg-success/18 text-success" };
  if (status === "failed") return { glyph: "✕", word: "Failed", className: "bg-failure/18 text-failure" };
  return { glyph: "○", word: "Pending", className: "bg-canvas text-steel" };
}

function cellSurface(people: PersonStatus[], today: boolean, milestone: ChallengeMilestone | undefined) {
  const statuses = people.map((person) => person.status);
  const failed = statuses.some((status) => status === "failed");
  const perfect = statuses.length > 0 && statuses.every((status) => status === "perfect");
  const fill = failed ? "bg-failure/12" : perfect ? "bg-success/12" : "bg-graphite";
  const edge = today
    ? "border-brass"
    : milestone
      ? "border-signal"
      : failed
        ? "border-failure/40"
        : perfect
          ? "border-success/40"
          : "border-steel/25";
  return `${fill} ${edge}`;
}

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
  people: Array<{ id: string; profile: Profile }>;
  rows: Array<Pick<DailyCheckin, "user_id" | "challenge_date" | "status">>;
}) {
  const milestones = challengeMilestones(start, end);
  const byDate = new Map(milestones.map((item) => [item.iso, item]));
  const prefix = month.slice(0, 7);

  return (
    <div>
      <div className="mb-3 grid grid-cols-7 gap-1 md:gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <p key={day} className="stamp text-center text-[11px] text-steel">
            {day}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: lead }, (_, index) => (
          <div key={`lead-${index}`} />
        ))}
        {Array.from({ length: count }, (_, index) => {
          const iso = `${prefix}-${String(index + 1).padStart(2, "0")}`;
          const inChallenge = iso >= start && iso <= end;
          const milestone = byDate.get(iso);
          const dayPeople: PersonStatus[] = inChallenge
            ? people.map(({ id, profile }) => {
                const row = rows.find((item) => item.user_id === id && item.challenge_date === iso);
                return {
                  id,
                  name: profile.display_name,
                  status: (row?.status ?? "pending") as PersonStatus["status"],
                };
              })
            : [];
          const dayNumber = inChallenge ? challengeDayNumber(iso, start) : null;
          const visible = dayPeople.slice(0, 4);
          const extra = dayPeople.length - visible.length;
          const surface = inChallenge
            ? cellSurface(dayPeople, iso === today, milestone)
            : "border-steel/15 bg-canvas opacity-45";
          const inner = (
            <>
              <div className="flex items-start justify-between gap-1">
                <p className="stamp tabular text-[11px] leading-none md:text-[13px]">{index + 1}</p>
                {milestone ? (
                  <p className="stamp text-[9px] leading-none text-brass md:text-[10px]">{milestone.label}</p>
                ) : null}
              </div>
              {dayNumber && !milestone ? (
                <p className="sr-only">Challenge day {dayNumber}</p>
              ) : null}
              {inChallenge ? (
                <div className="mt-auto flex flex-wrap gap-1">
                  {visible.map((person) => {
                    const mark = markFor(person.status);
                    return (
                      <span
                        key={person.id}
                        title={`${person.name}: ${mark.word}`}
                        className={`inline-flex min-h-6 min-w-6 items-center justify-center rounded-[4px] px-1 text-[12px] font-bold md:min-h-7 md:min-w-7 md:text-[13px] ${mark.className}`}
                      >
                        <span aria-hidden="true">{mark.glyph}</span>
                        <span className="sr-only">{`${person.name} ${mark.word}`}</span>
                      </span>
                    );
                  })}
                  {extra > 0 ? <span className="stamp text-[9px] text-steel">+{extra}</span> : null}
                </div>
              ) : null}
            </>
          );

          if (!inChallenge) {
            return (
              <div key={iso} className={`flex min-h-[4.75rem] flex-col gap-1 rounded-plate border p-1.5 md:min-h-[6.5rem] md:p-2 ${surface}`}>
                {inner}
              </div>
            );
          }

          return (
            <Link
              key={iso}
              href={`/calendar/${iso}`}
              className={`flex min-h-[4.75rem] flex-col gap-1 rounded-plate border p-1.5 md:min-h-[6.5rem] md:p-2 ${surface}`}
            >
              {inner}
            </Link>
          );
        })}
      </div>
      <div className="mt-5 flex flex-col gap-3 text-sm text-steel md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          <li className="inline-flex items-center gap-1">
            <span className="inline-flex size-6 items-center justify-center rounded-[4px] bg-success/18 text-[12px] font-bold text-success">✓</span>
            Perfect
          </li>
          <li className="inline-flex items-center gap-1">
            <span className="inline-flex size-6 items-center justify-center rounded-[4px] bg-failure/18 text-[12px] font-bold text-failure">✕</span>
            Failed
          </li>
          <li className="inline-flex items-center gap-1">
            <span className="inline-flex size-6 items-center justify-center rounded-[4px] bg-canvas text-[12px] font-bold">○</span>
            Pending
          </li>
        </ul>
        <p className="stamp text-[11px] text-brass">{milestones.map((item) => item.label).join(" · ")}</p>
      </div>
    </div>
  );
}
