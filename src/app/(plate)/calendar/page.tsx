import Link from "next/link";
import { redirect } from "next/navigation";
import { Plate, StatusMark } from "@/components/plate";
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
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <h1 className="stamp text-[32px] leading-none">{monthLabel(month)}</h1>
        <div className="flex gap-3 text-sm">
          {prev >= CHALLENGE_START ? (
            <Link className="text-steel hover:text-offwhite" href={`/calendar?month=${monthKey(prev)}`}>
              Previous
            </Link>
          ) : null}
          {next <= CHALLENGE_END ? (
            <Link className="text-steel hover:text-offwhite" href={`/calendar?month=${monthKey(next)}`}>
              Next
            </Link>
          ) : null}
        </div>
      </header>
      <Plate>
        <div className="mb-3 grid grid-cols-7 gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <p key={day} className="stamp text-center text-[10px] text-steel">
              {day}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
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
                className={`min-h-16 border border-steel/20 p-1 ${iso === today ? "border-brass" : ""} ${
                  inChallenge ? "hover:border-offwhite" : "opacity-40"
                }`}
                style={{ borderRadius: 8 }}
              >
                <p className="stamp text-[11px]">{index + 1}</p>
                {inChallenge ? (
                  <div className="mt-1 space-y-1">
                    <StatusMark status={mine?.status ?? (iso > today ? "pending" : "pending")} />
                    {context.partner ? <StatusMark status={theirs?.status ?? "pending"} /> : null}
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
