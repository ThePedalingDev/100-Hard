import { redirect } from "next/navigation";
import { EmptyStill } from "@/components/art";
import { PageHeader, Plate } from "@/components/plate";
import { SpoonIcon } from "@/components/icons";
import { formatStampDate } from "@/lib/challenge";
import { loadAppContext, loadCheckinsByIds, loadSpoons } from "@/lib/data";
import { missedCategories, categoryLabel } from "@/lib/scoring";
import { RepaymentBoard } from "@/components/repayment-board";

export default async function SpoonsPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const { entries, repayments } = await loadSpoons(context.challenge.id);
  const earned = entries.filter((entry) => entry.type === "earned");
  const nameById = new Map(context.members.map((member) => [member.profile.id, member.profile.display_name]));
  const debtors = context.members
    .filter((member) => member.profile.id !== context.userId && member.stats.spoons > 0)
    .map((member) => ({
      id: member.profile.id,
      name: member.profile.display_name,
      spoons: member.stats.spoons,
    }));

  const checkinIds = earned.map((entry) => entry.daily_checkin_id).filter((id): id is string => Boolean(id));
  const checkinsById = await loadCheckinsByIds(checkinIds);
  const history = earned.map((entry) => {
    if (!entry.daily_checkin_id) {
      return { entry, date: entry.created_at.slice(0, 10), missed: [] as string[] };
    }
    const match = checkinsById.get(entry.daily_checkin_id);
    return {
      entry,
      date: match?.challenge_date ?? entry.created_at.slice(0, 10),
      missed: match ? missedCategories(match).map(categoryLabel) : [],
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wooden spoons"
        kicker="One spoon per failed day. Explanation is not exemption."
      />
      <Plate tone="well">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {context.members.map((member) => (
            <Balance
              key={member.profile.id}
              name={member.profile.id === context.userId ? "You" : member.profile.display_name}
              count={member.stats.spoons}
            />
          ))}
        </div>
      </Plate>
      <section className="flex flex-col gap-4">
        <h2 className="text-[18px] leading-none">Ledger</h2>
        {history.length === 0 ? (
          <EmptyStill alt="Wooden spoon on a white inspection plate">
            No spoons issued yet.
          </EmptyStill>
        ) : (
          history.map(({ entry, date, missed }) => (
            <Plate key={entry.id} as="article">
              <p className="stamp inline-flex items-center gap-2 text-[16px] leading-none text-mark">
                <SpoonIcon className="size-4" />
                {formatStampDate(date)}
              </p>
              <p className="mt-2 text-sm leading-6 text-steel">
                {entry.user_id === context.userId ? "You" : nameById.get(entry.user_id) ?? "Member"}
              </p>
              {missed.length ? <p className="mt-1 text-sm leading-6">Missed: {missed.join(", ")}</p> : null}
            </Plate>
          ))
        )}
      </section>
      <RepaymentBoard
        finished={context.finished}
        userId={context.userId}
        debtors={debtors}
        repayments={repayments}
      />
    </div>
  );
}

function Balance({ name, count }: { name: string; count: number }) {
  return (
    <div>
      <p className="font-display text-[32px] leading-none tabular text-mark">{count}</p>
      <p className="stamp mt-2 text-[11px] text-steel">{name}</p>
    </div>
  );
}
