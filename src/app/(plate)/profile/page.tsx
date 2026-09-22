import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { ProfileForm } from "@/components/profile-form";
import { Button, Plate } from "@/components/plate";
import { ThemeToggle } from "@/components/theme-toggle";
import { loadAppContext, signedUrl } from "@/lib/data";

export default async function ProfilePage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");

  const avatarUrl = await signedUrl(context.profile?.avatar_path ?? null, "avatars");

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <h1 className="stamp text-[32px] leading-none">Profile</h1>
        <ThemeToggle />
      </div>
      <Plate>
        <p className="text-sm text-steel">{context.email}</p>
        {context.challenge ? (
          <p className="mt-2 text-sm">
            Invite code <span className="stamp text-brass">{context.challenge.invite_code}</span>
          </p>
        ) : null}
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="mt-4 size-20 border border-brass object-cover" style={{ borderRadius: 8 }} />
        ) : null}
      </Plate>
      <ProfileForm
        displayName={context.profile?.display_name ?? ""}
        dietCommitment={context.profile?.diet_commitment ?? ""}
        avatarUrl={avatarUrl}
      />
      <form action={logoutAction}>
        <Button type="submit" variant="ghost">
          Sign out
        </Button>
      </form>
    </div>
  );
}
