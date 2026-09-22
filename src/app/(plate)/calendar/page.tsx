import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarMonth } from "@/components/calendar-month";
import { PageHeader, Plate } from "@/components/plate";
import {
  addDays,
  dateInChallengeTz,
  daysInMonth,
  monthKey,
  monthLabel,
  weekdayIndexMonday,
} from "@/lib/challenge";
import { challengeMilestones, clampToChallengeRange } from "@/lib/challenge-dates";
import { loadAppContext, loadMonth, signedUrl } from "@/lib/data";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const params = await searchParams;
  const today = dateInChallengeTz();
  const start = context.challenge.start_date;
  const end = context.challenge.end_date;
  const month = monthKey(clampToChallengeRange(monthKey(params.month ?? today), start, end));
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const first = `${month.slice(0, 7)}-01`;
  const lead = weekdayIndexMonday(first);
  const count = daysInMonth(year, monthIndex);
  const rows = await loadMonth(context.challenge.id, month);
  const avatars = new Map(
    await Promise.all(
      context.members.map(async (member) => [
        member.profile.id,
        await signedUrl(member.profile.avatar_path, "avatars"),
      ] as const),
    ),
  );
  const prev = addDays(first, -1);
  const next = addDays(`${month.slice(0, 7)}-${String(count).padStart(2, "0")}`, 1);
  const marks = challengeMilestones(start, end);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={monthLabel(month)}
        kicker={marks.map((item) => item.label).join(" · ")}
        action={
          <div className="flex gap-2">
            {prev >= start ? (
              <Link
                className="stamp-press inline-flex min-h-12 items-center rounded-plate border border-steel/40 px-4 text-[15px] font-bold tracking-[-0.01em] text-steel hover:border-club hover:text-offwhite"
                href={`/calendar?month=${monthKey(prev)}`}
              >
                Previous
              </Link>
            ) : null}
            {next <= end ? (
              <Link
                className="stamp-press inline-flex min-h-12 items-center rounded-plate border border-steel/40 px-4 text-[15px] font-bold tracking-[-0.01em] text-steel hover:border-club hover:text-offwhite"
                href={`/calendar?month=${monthKey(next)}`}
              >
                Next
              </Link>
            ) : null}
          </div>
        }
      />
      <Plate>
        <CalendarMonth
          month={month}
          lead={lead}
          count={count}
          today={today}
          start={start}
          end={end}
          people={context.members.map((member) => ({
            id: member.profile.id,
            profile: member.profile,
            avatarUrl: avatars.get(member.profile.id) ?? null,
          }))}
          rows={rows}
        />
      </Plate>
    </div>
  );
}
