import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarMonth } from "@/components/calendar-month";
import { CalendarWeek } from "@/components/calendar-week";
import { PageHeader, Plate } from "@/components/plate";
import {
  addDays,
  dateInChallengeTz,
  daysInMonth,
  monthKey,
  monthLabel,
  startOfWeekMonday,
  weekDates,
  weekRangeLabel,
  weekdayIndexMonday,
} from "@/lib/challenge";
import { challengeMilestones, clampToChallengeRange } from "@/lib/challenge-dates";
import { loadAppContext, loadMonth, loadRange, signedUrl } from "@/lib/data";

type CalendarView = "month" | "week";

function calendarHref(view: CalendarView, anchor: string) {
  if (view === "week") return `/calendar?view=week&week=${anchor}`;
  return `/calendar?view=month&month=${monthKey(anchor)}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; week?: string; view?: string }>;
}) {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const params = await searchParams;
  const today = dateInChallengeTz();
  const start = context.challenge.start_date;
  const end = context.challenge.end_date;
  const view: CalendarView = params.view === "week" ? "week" : "month";

  const month = monthKey(clampToChallengeRange(monthKey(params.month ?? today), start, end));
  const weekAnchor = clampToChallengeRange(params.week ?? today, start, end);
  const weekStart = startOfWeekMonday(weekAnchor);
  const weekEnd = addDays(weekStart, 6);
  const weekDays = weekDates(weekAnchor);

  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const first = `${month.slice(0, 7)}-01`;
  const lead = weekdayIndexMonday(first);
  const count = daysInMonth(year, monthIndex);

  const rows =
    view === "week"
      ? await loadRange(context.challenge.id, weekStart, weekEnd)
      : await loadMonth(context.challenge.id, month);

  const avatars = new Map(
    await Promise.all(
      context.members.map(async (member) => [
        member.profile.id,
        await signedUrl(member.profile.avatar_path, "avatars"),
      ] as const),
    ),
  );
  const people = context.members.map((member) => ({
    id: member.profile.id,
    profile: member.profile,
    avatarUrl: avatars.get(member.profile.id) ?? null,
  }));

  const marks = challengeMilestones(start, end);
  const title = view === "week" ? weekRangeLabel(weekStart, weekEnd) : monthLabel(month);

  const monthPrev = addDays(first, -1);
  const monthNext = addDays(`${month.slice(0, 7)}-${String(count).padStart(2, "0")}`, 1);
  const weekPrev = addDays(weekStart, -7);
  const weekNext = addDays(weekStart, 7);
  const firstWeekStart = startOfWeekMonday(start);
  const lastWeekStart = startOfWeekMonday(end);

  const prevHref =
    view === "week"
      ? weekStart > firstWeekStart
        ? calendarHref("week", weekPrev)
        : null
      : monthPrev >= start
        ? calendarHref("month", monthPrev)
        : null;
  const nextHref =
    view === "week"
      ? weekStart < lastWeekStart
        ? calendarHref("week", weekNext)
        : null
      : monthNext <= end
        ? calendarHref("month", monthNext)
        : null;

  const monthToggleHref = calendarHref("month", view === "week" ? weekAnchor : month);
  const weekToggleHref = calendarHref("week", view === "week" ? weekAnchor : today);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        kicker={marks.map((item) => item.label).join(" · ")}
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="view-segment">
              <Link
                href={monthToggleHref}
                className={`stamp-press view-segment-link ${view === "month" ? "is-active" : ""}`}
              >
                Month
              </Link>
              <Link
                href={weekToggleHref}
                className={`stamp-press view-segment-link ${view === "week" ? "is-active" : ""}`}
              >
                Week
              </Link>
            </div>
            <div className="flex gap-2">
              {prevHref ? (
                <Link
                  className="stamp-press inline-flex min-h-10 flex-1 items-center justify-center rounded-plate border border-steel/40 px-4 text-[13px] font-bold tracking-[-0.01em] text-steel hover:border-club hover:text-offwhite sm:min-h-12 sm:flex-none sm:text-[15px]"
                  href={prevHref}
                >
                  Previous
                </Link>
              ) : null}
              {nextHref ? (
                <Link
                  className="stamp-press inline-flex min-h-10 flex-1 items-center justify-center rounded-plate border border-steel/40 px-4 text-[13px] font-bold tracking-[-0.01em] text-steel hover:border-club hover:text-offwhite sm:min-h-12 sm:flex-none sm:text-[15px]"
                  href={nextHref}
                >
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        }
      />
      <Plate>
        {view === "week" ? (
          <CalendarWeek
            dates={weekDays}
            today={today}
            start={start}
            end={end}
            people={people}
            rows={rows}
          />
        ) : (
          <CalendarMonth
            month={month}
            lead={lead}
            count={count}
            today={today}
            start={start}
            end={end}
            people={people}
            rows={rows}
          />
        )}
      </Plate>
    </div>
  );
}
