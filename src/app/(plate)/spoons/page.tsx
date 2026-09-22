import { redirect } from "next/navigation";
import { ART, EmptyStill } from "@/components/art";
import { PageHeader, Plate } from "@/components/plate";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wooden spoons"
        kicker="One spoon per failed day. Explanation is not exemption."
      />
      <Plate>
        <div className="grid grid-cols-2 gap-4">
          <Balance name={context.profile?.display_name ?? "You"} count={context.me?.stats.spoons ?? 0} />
          <Balance name={context.partner?.display_name ?? "Partner"} count={context.other?.stats.spoons ?? 0} />
        </div>
      </Plate>
      <section className="flex flex-col gap-4">
        <h2 className="stamp text-[18px] leading-none">Ledger</h2>
        {history.length === 0 ? (
          <EmptyStill src={ART.spoon} alt="Wooden spoon on a navy iron inspection plate">
            No spoons issued yet.
          </EmptyStill>
        ) : (
          history.map(({ entry, date, missed }) => (
            <Plate key={entry.id} as="article">
              <p className="stamp inline-flex items-center gap-2 text-[16px] leading-none text-brass">
                <SpoonIcon className="size-4" />
                {formatStampDate(date)}
              </p>
              <p className="mt-2 text-sm leading-6 text-steel">
                {entry.user_id === context.userId ? "You" : context.partner?.display_name ?? "Partner"}
              </p>
              {missed.length ? <p className="mt-1 text-sm leading-6">Missed: {missed.join(", ")}</p> : null}
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
      <p className="stamp text-[32px] leading-none tabular text-brass">{count}</p>
      <p className="stamp mt-2 text-[11px] text-steel">{name}</p>
    </div>
  );
}
