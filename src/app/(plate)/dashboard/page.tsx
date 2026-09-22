import Link from "next/link";
import { redirect } from "next/navigation";
import { DailyCard } from "@/components/daily-card";
import { InviteShare } from "@/components/invite-share";
import { Leaderboard } from "@/components/leaderboard";
import { PageHeader, Plate } from "@/components/plate";
import { SpoonIcon } from "@/components/icons";
import { formatStampDate } from "@/lib/challenge";
import { MAX_CHALLENGE_MEMBERS, challengeLength } from "@/lib/challenge-dates";
import { loadAppContext, signedUrl } from "@/lib/data";

export default async function DashboardPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.schemaReady) {
    return (
      <Plate>
        <h1 className="text-[32px] leading-none">Schema not applied</h1>
        <p className="mt-2 text-sm leading-6 text-steel">
          The 100-Hard Supabase project is empty. Approve the proposed schema in
          `supabase/proposed/001_mvp.sql` and I will apply it.
        </p>
      </Plate>
    );
  }
  if (!context.profile?.display_name || !context.profile.diet_commitment) {
    redirect("/onboarding/profile");
  }
  if (!context.challenge) {
    redirect("/onboarding/challenge");
  }

  const avatars = new Map(
    await Promise.all(
      context.members.map(async (member) => [
        member.profile.id,
        await signedUrl(member.profile.avatar_path, "avatars"),
      ] as const),
    ),
  );
  const others = context.members.filter((member) => member.profile.id !== context.userId);

  if (context.finished) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={context.challenge.name}
          kicker="The plate is closed. Time to pay the spoons."
        />
        <Plate>
          <div className="grid grid-cols-2 gap-4">
            {context.members.map((member) => (
              <FinalColumn
                key={member.profile.id}
                title={member.profile.id === context.userId ? "You" : member.profile.display_name}
                stats={member.stats}
              />
            ))}
          </div>
          <Link href="/spoons" className="mt-5 inline-flex min-h-12 items-center font-bold tracking-[-0.01em] text-brass">
            Open spoon repayment
          </Link>
        </Plate>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={context.challenge.name}
        kicker={
          <>
            Ends {formatStampDate(context.challenge.end_date)} ·{" "}
            <span className="stamp tabular text-offwhite">{context.remaining}</span> days remaining
          </>
        }
        action={<p className="stamp text-[11px] text-steel">SAST</p>}
      />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
        {context.members.length > 0 ? (
          <Leaderboard
            members={context.members}
            userId={context.userId}
            totalDays={challengeLength(context.challenge.start_date, context.challenge.end_date)}
            avatars={avatars}
          />
        ) : null}

        {context.me ? (
          <Plate>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Stat value={context.me.stats.perfectDays} label="Perfect days" />
              <Stat value={`${context.me.stats.completion}%`} label="Completion" />
              <Stat value={context.me.stats.streak} label="Current streak" />
              <Stat value={context.me.stats.spoons} label="Spoons" icon />
            </div>
          </Plate>
        ) : null}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-[18px] leading-none">Today</h2>
        {context.me ? (
          <DailyCard
            checkin={context.me.checkin!}
            owner={context.me.profile}
            viewerId={context.userId}
            likes={context.me.likes}
            comments={context.me.comments}
            canEdit
            avatarUrl={avatars.get(context.userId) ?? null}
          />
        ) : null}
        {others.map((member) => (
          <DailyCard
            key={member.profile.id}
            checkin={member.checkin!}
            owner={member.profile}
            viewerId={context.userId}
            likes={member.likes}
            comments={member.comments}
            canEdit={false}
            avatarUrl={avatars.get(member.profile.id) ?? null}
          />
        ))}
        {context.members.length < 2 ? (
          <Plate>
            <InviteShare waiting code={context.challenge.invite_code} />
          </Plate>
        ) : context.members.length < MAX_CHALLENGE_MEMBERS ? (
          <Plate>
            <InviteShare code={context.challenge.invite_code} />
          </Plate>
        ) : null}
      </section>
    </div>
  );
}

function Stat({ value, label, icon }: { value: string | number; label: string; icon?: boolean }) {
  return (
    <div>
      <p className="stamp flex items-center gap-1 text-[32px] leading-none tabular">
        {icon ? <SpoonIcon className="size-5 text-brass" /> : null}
        {value}
      </p>
      <p className="stamp mt-2 text-[11px] text-steel">{label}</p>
    </div>
  );
}

function FinalColumn({
  title,
  stats,
}: {
  title: string;
  stats?: { perfectDays: number; completion: number; streak: number; longest: number; spoons: number };
}) {
  return (
    <div>
      <h2 className="text-[16px] leading-none">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-steel">
        <li>Perfect days {stats?.perfectDays ?? 0}</li>
        <li>Completion {stats?.completion ?? 0}%</li>
        <li>Longest streak {stats?.longest ?? 0}</li>
        <li>Spoons outstanding {stats?.spoons ?? 0}</li>
      </ul>
    </div>
  );
}
