import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { ChallengeRoster } from "@/components/challenge-roster";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader, Plate } from "@/components/plate";
import { SubmitButton } from "@/components/submit-button";
import { loadAppContext, signedUrl } from "@/lib/data";

export default async function ProfilePage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");

  const avatarUrl = await signedUrl(context.profile?.avatar_path ?? null, "avatars");
  const memberships = await Promise.all(
    context.memberships.map(async (membership) => ({
      ...membership,
      members: await Promise.all(
        membership.members.map(async (member) => ({
          ...member,
          avatarUrl: await signedUrl(member.profile.avatar_path, "avatars"),
        })),
      ),
    })),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" />
      <Plate>
        <p className="text-sm leading-6 text-steel">{context.email}</p>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="mt-4 size-20 rounded-plate border border-brass object-cover"
          />
        ) : null}
      </Plate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/onboarding/challenge"
          className="stamp stamp-press inline-flex min-h-11 items-center justify-center rounded-plate bg-brass px-4 text-[13px] text-onproof"
        >
          Create challenge
        </Link>
        <Link
          href="/onboarding/challenge#join"
          className="stamp stamp-press inline-flex min-h-11 items-center justify-center rounded-plate border border-steel/50 px-4 text-[13px]"
        >
          Join with a code
        </Link>
      </div>
      <ChallengeRoster
        memberships={memberships}
        activeId={context.challenge?.id ?? null}
        today={context.today}
      />
      <ProfileForm
        displayName={context.profile?.display_name ?? ""}
        dietCommitment={context.profile?.diet_commitment ?? ""}
        avatarUrl={avatarUrl}
      />
      <form action={logoutAction}>
        <SubmitButton variant="ghost">Sign out</SubmitButton>
      </form>
    </div>
  );
}
