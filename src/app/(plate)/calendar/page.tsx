import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader, Plate, StatusMark } from "@/components/plate";
import {
  CHALLENGE_END,
  CHALLENGE_START,
  addDays,
  clampToChallenge,
  dateInChallengeTz,
  daysInMonth,
  monthKey,
  monthLabel,
  weekdayIndexMonday,
} from "@/lib/challenge";
import { loadAppContext, loadMonth } from "@/lib/data";

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
  const month = clampToChallenge(monthKey(params.month ?? today));
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const first = `${month.slice(0, 7)}-01`;
  const lead = weekdayIndexMonday(first);
  const count = daysInMonth(year, monthIndex);
  const rows = await loadMonth(context.challenge.id, month);

  const prev = addDays(first, -1);
  const next = addDays(`${month.slice(0, 7)}-${String(count).padStart(2, "0")}`, 1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={monthLabel(month)}
        action={
          <div className="flex gap-2">
            {prev >= CHALLENGE_START ? (
              <Link
                className="stamp stamp-press inline-flex min-h-11 items-center rounded-plate border border-steel/40 px-3 text-[11px] text-steel hover:border-offwhite hover:text-offwhite"
                href={`/calendar?month=${monthKey(prev)}`}
              >
                Previous
              </Link>
            ) : null}
            {next <= CHALLENGE_END ? (
              <Link
                className="stamp stamp-press inline-flex min-h-11 items-center rounded-plate border border-steel/40 px-3 text-[11px] text-steel hover:border-offwhite hover:text-offwhite"
                href={`/calendar?month=${monthKey(next)}`}
              >
                Next
              </Link>
            ) : null}
          </div>
        }
      />
      <Plate>
        <div className="mb-4 grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <p key={day} className="stamp text-center text-[11px] text-steel">
              {day}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: lead }, (_, index) => (
            <div key={`lead-${index}`} />
          ))}
          {Array.from({ length: count }, (_, index) => {
            const iso = `${month.slice(0, 7)}-${String(index + 1).padStart(2, "0")}`;
            const mine = rows.find((row) => row.user_id === context.userId && row.challenge_date === iso);
            const theirs = rows.find((row) => row.user_id !== context.userId && row.challenge_date === iso);
            const inChallenge = iso >= CHALLENGE_START && iso <= CHALLENGE_END;
            return (
              <Link
                key={iso}
                href={inChallenge ? `/calendar/${iso}` : "/calendar"}
                className={`flex min-h-18 flex-col gap-1 rounded-plate border p-2 ${
                  iso === today ? "border-brass" : "border-steel/20"
                } ${inChallenge ? "hover:border-offwhite" : "opacity-40"}`}
              >
                <p className="stamp tabular text-[11px]">{index + 1}</p>
                {inChallenge ? (
                  <div className="flex gap-1">
                    <StatusMark compact status={mine?.status ?? "pending"} />
                    {context.partner ? <StatusMark compact status={theirs?.status ?? "pending"} /> : null}
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      </Plate>
    </div>
  );
}
