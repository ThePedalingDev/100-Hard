import { redirect } from "next/navigation";
import { HistoryTimeline } from "@/components/history-timeline";
import { PageHeader, Plate } from "@/components/plate";
import { addDays, formatStampDate } from "@/lib/challenge";
import { challengeDayNumber, clampToChallengeRange } from "@/lib/challenge-dates";
import { completedCategories, isPerfect } from "@/lib/scoring";
import { loadAppContext, loadUserHistory } from "@/lib/data";

function challengeDatesDesc(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = end;
  while (cursor >= start) {
    dates.push(cursor);
    cursor = addDays(cursor, -1);
  }
  return dates;
}

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
  const focusDate =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? clampToChallengeRange(params.date, start, latest)
      : undefined;
  const checkins = await loadUserHistory(context.challenge.id, context.userId, start, latest);
  const byDate = new Map(checkins.map((checkin) => [checkin.challenge_date, checkin]));
  const dates = challengeDatesDesc(start, latest);
  const perfectDays = checkins.filter((checkin) => isPerfect(checkin)).length;
  const stampedDays = checkins.filter((checkin) => completedCategories(checkin) > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My history" backHref="/profile" backLabel="Profile" />
      <Plate tone="well">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HistoryStat value={dates.length} label="Days in view" />
          <HistoryStat value={stampedDays} label="Days stamped" />
          <HistoryStat value={perfectDays} label="Perfect days" accent="success" />
          <HistoryStat
            value={dates.length ? `${Math.round((perfectDays / dates.length) * 100)}%` : "0%"}
            label="Perfect rate"
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-steel">
          Challenge window {formatStampDate(start)} through {formatStampDate(latest)}.
        </p>
      </Plate>
      <HistoryTimeline
        start={start}
        today={context.today}
        dates={dates}
        checkins={byDate}
        focusDate={focusDate}
      />
    </div>
  );
}

function HistoryStat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: "success";
}) {
  return (
    <div>
      <p className={`stamp tabular text-[28px] leading-none ${accent === "success" ? "text-success" : ""}`}>
        {value}
      </p>
      <p className="stamp mt-2 text-[11px] text-steel">{label}</p>
    </div>
  );
}
