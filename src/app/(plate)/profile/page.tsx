import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { InviteShare } from "@/components/invite-share";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader, Plate } from "@/components/plate";
import { SubmitButton } from "@/components/submit-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { loadAppContext, signedUrl } from "@/lib/data";

export default async function ProfilePage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");

  const avatarUrl = await signedUrl(context.profile?.avatar_path ?? null, "avatars");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" action={<ThemeToggle />} />
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
      {context.challenge ? (
        <Plate>
          <InviteShare code={context.challenge.invite_code} />
        </Plate>
      ) : null}
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
