import Link from "next/link";
import { redirect } from "next/navigation";
import { DailyCard } from "@/components/daily-card";
import { HeadToHead } from "@/components/head-to-head";
import { InviteShare } from "@/components/invite-share";
import { PageHeader, Plate } from "@/components/plate";
import { SpoonIcon } from "@/components/icons";
import { loadAppContext, signedUrl } from "@/lib/data";

export default async function DashboardPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.schemaReady) {
    return (
      <Plate>
        <h1 className="stamp text-[32px] leading-none">Schema not applied</h1>
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

  const meAvatar = await signedUrl(context.profile.avatar_path, "avatars");
  const otherAvatar = await signedUrl(context.partner?.avatar_path ?? null, "avatars");

  if (context.finished) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={context.challenge.name}
          kicker="The plate is closed. Time to pay the spoons."
        />
        <Plate>
          <div className="grid grid-cols-2 gap-4">
            <FinalColumn title={context.me?.profile.display_name ?? "You"} stats={context.me?.stats} />
            <FinalColumn title={context.other?.profile.display_name ?? "Partner"} stats={context.other?.stats} />
          </div>
          <Link href="/spoons" className="stamp mt-5 inline-flex min-h-11 items-center text-brass">
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
            Ends 31 December · <span className="stamp tabular text-offwhite">{context.remaining}</span> days remaining
          </>
        }
        action={<p className="stamp text-[11px] text-steel">SAST</p>}
      />

      {context.me ? (
        <HeadToHead
          me={context.me}
          other={context.other}
          avatars={{ me: meAvatar, other: otherAvatar }}
        />
      ) : null}

      {context.me ? (
        <Plate>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
            <Stat value={context.me.stats.perfectDays} label="Perfect days" />
            <Stat value={`${context.me.stats.completion}%`} label="Completion" />
            <Stat value={context.me.stats.streak} label="Current streak" />
            <Stat value={context.me.stats.spoons} label="Spoons" icon />
          </div>
        </Plate>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="stamp text-[18px] leading-none">Today</h2>
        {context.me ? (
          <DailyCard
            checkin={context.me.checkin!}
            owner={context.me.profile}
            viewerId={context.userId}
            likes={context.me.likes}
            comments={context.me.comments}
            canEdit
            avatarUrl={meAvatar}
          />
        ) : null}
        {context.other ? (
          <DailyCard
            checkin={context.other.checkin!}
            owner={context.other.profile}
            viewerId={context.userId}
            likes={context.other.likes}
            comments={context.other.comments}
            canEdit={false}
            avatarUrl={otherAvatar}
          />
        ) : (
          <Plate>
            <InviteShare waiting code={context.challenge.invite_code} />
          </Plate>
        )}
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
      <h2 className="stamp text-[16px] leading-none">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-steel">
        <li>Perfect days {stats?.perfectDays ?? 0}</li>
        <li>Completion {stats?.completion ?? 0}%</li>
        <li>Longest streak {stats?.longest ?? 0}</li>
        <li>Spoons outstanding {stats?.spoons ?? 0}</li>
      </ul>
    </div>
  );
}
