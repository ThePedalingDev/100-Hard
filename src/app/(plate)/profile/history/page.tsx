import Link from "next/link";
import { redirect } from "next/navigation";
import { HistoryDatePicker } from "@/components/history-date-picker";
import { HistoryDay } from "@/components/history-day";
import { PageHeader, Plate } from "@/components/plate";
import { formatStampDate } from "@/lib/challenge";
import {
  challengeDayNumber,
  challengeMilestones,
  clampToChallengeRange,
} from "@/lib/challenge-dates";
import { loadAppContext, loadUserCheckin } from "@/lib/data";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const params = await searchParams;
  const start = context.challenge.start_date;
  const end = context.challenge.end_date;
  const latest = clampToChallengeRange(context.today, start, end);
  const requested =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : latest;
  const date = clampToChallengeRange(requested, start, latest);
  const checkin = await loadUserCheckin(context.challenge.id, context.userId, date);
  const dayNumber = challengeDayNumber(date, start);
  const milestone = challengeMilestones(start, end).find((item) => item.iso === date);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My history"
        kicker="Pick a challenge day to inspect what you stamped and wrote."
        action={
          <Link
            className="stamp-press inline-flex min-h-12 items-center rounded-plate border border-steel/40 px-4 text-[15px] font-bold tracking-[-0.01em] text-steel hover:border-club hover:text-offwhite"
            href="/profile"
          >
            Profile
          </Link>
        }
      />
      <Plate>
        <HistoryDatePicker start={start} max={latest} value={date} />
      </Plate>
      <div>
        <h2 className="text-[18px] leading-none">{formatStampDate(date)}</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          Day {dayNumber}
          {milestone ? ` · ${milestone.label}` : ""}
        </p>
      </div>
      {checkin ? (
        <HistoryDay checkin={checkin} />
      ) : (
        <Plate>
          <p className="text-sm leading-6 text-steel">
            No inspection recorded for this day. Pending days stay empty until you stamp them on the
            dashboard.
          </p>
        </Plate>
      )}
    </div>
  );
}