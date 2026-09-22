import { redirect } from "next/navigation";
import { Plate } from "@/components/plate";
import { SpoonIcon } from "@/components/icons";
import { formatStampDate } from "@/lib/challenge";
import { loadAppContext, loadCheckin, loadSpoons } from "@/lib/data";
import { missedCategories, categoryLabel } from "@/lib/scoring";
import { RepaymentBoard } from "@/components/repayment-board";

export default async function SpoonsPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const { entries, repayments } = await loadSpoons(context.challenge.id);
  const earned = entries.filter((entry) => entry.type === "earned");

  const history = await Promise.all(
    earned.map(async (entry) => {
      if (!entry.daily_checkin_id) {
        return { entry, date: entry.created_at.slice(0, 10), missed: [] as string[] };
      }
      const match = await loadCheckin(entry.daily_checkin_id);
      return {
        entry,
        date: match?.challenge_date ?? entry.created_at.slice(0, 10),
        missed: match ? missedCategories(match).map(categoryLabel) : [],
      };
    }),
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="stamp text-[32px] leading-none">Wooden spoons</h1>
        <p className="mt-2 text-sm text-steel">One spoon per failed day. Explanation is not exemption.</p>
      </header>
      <Plate>
        <div className="grid grid-cols-2 gap-4">
          <Balance name={context.profile?.display_name ?? "You"} count={context.me?.stats.spoons ?? 0} />
          <Balance name={context.partner?.display_name ?? "Partner"} count={context.other?.stats.spoons ?? 0} />
        </div>
      </Plate>
      <section className="space-y-3">
        <h2 className="stamp text-[18px]">Ledger</h2>
        {history.length === 0 ? (
          <Plate>
            <p className="text-sm text-steel">No spoons issued yet.</p>
          </Plate>
        ) : (
          history.map(({ entry, date, missed }) => (
            <Plate key={entry.id} as="article">
              <p className="stamp inline-flex items-center gap-2 text-[14px] text-brass">
                <SpoonIcon className="size-4" />
                {formatStampDate(date)}
              </p>
              <p className="mt-2 text-sm text-steel">
                {entry.user_id === context.userId ? "You" : context.partner?.display_name ?? "Partner"}
              </p>
              {missed.length ? <p className="mt-1 text-sm">Missed: {missed.join(", ")}</p> : null}
            </Plate>
          ))
        )}
      </section>
      <RepaymentBoard
        finished={context.finished}
        userId={context.userId}
        partnerId={context.partner?.id ?? null}
        partnerName={context.partner?.display_name ?? "Partner"}
        repayments={repayments}
      />
    </div>
  );
}

function Balance({ name, count }: { name: string; count: number }) {
  return (
    <div>
      <p className="stamp text-[28px] leading-none tabular text-brass">{count}</p>
      <p className="stamp mt-1 text-[11px] text-steel">{name}</p>
    </div>
  );
}
