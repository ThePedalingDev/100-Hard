import Link from "next/link";
import { redirect } from "next/navigation";
import { MemberPlate } from "@/components/member-plate";
import { PageHeader, Plate } from "@/components/plate";
import { MAX_CHALLENGE_MEMBERS } from "@/lib/challenge-dates";
import { loadAppContext, signedUrl } from "@/lib/data";

export default async function MembersPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const avatars = new Map(
    await Promise.all(
      context.members.map(async (member) => [
        member.profile.id,
        await signedUrl(member.profile.avatar_path, "avatars"),
      ] as const),
    ),
  );
  const ranked = [...context.members].sort((a, b) => {
    const byDays = b.stats.perfectDays - a.stats.perfectDays;
    if (byDays !== 0) return byDays;
    return a.profile.display_name.localeCompare(b.profile.display_name);
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Members"
        kicker={
          <>
            {context.challenge.name} ·{" "}
            <span className="stamp tabular text-offwhite">{ranked.length}</span> of {MAX_CHALLENGE_MEMBERS}
          </>
        }
        action={
          <Link
            className="stamp-press inline-flex min-h-12 items-center rounded-plate border border-steel/40 px-4 text-[15px] font-bold tracking-[-0.01em] text-steel hover:border-club hover:text-offwhite"
            href="/profile"
          >
            Profile
          </Link>
        }
      />
      {ranked.length === 0 ? (
        <Plate>
          <p className="text-sm leading-6 text-steel">
            No members on this challenge yet. Invite someone from Profile.
          </p>
        </Plate>
      ) : (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
          {ranked.map((member) => (
            <MemberPlate
              key={member.profile.id}
              member={member}
              mine={member.profile.id === context.userId}
              avatarUrl={avatars.get(member.profile.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}