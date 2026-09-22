import { redirect } from "next/navigation";
import { ChatRoom } from "@/components/chat-room";
import { MemberRings } from "@/components/member-rings";
import { PageHeader } from "@/components/plate";
import { loadAppContext, loadChat, signedUrl } from "@/lib/data";

export default async function SocialPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const [messages, avatars] = await Promise.all([
    loadChat(context.challenge.id),
    Promise.all(
      context.members.map(async (member) => [
        member.profile.id,
        await signedUrl(member.profile.avatar_path, "avatars"),
      ] as const),
    ),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Social" kicker={context.challenge.name} />
      <MemberRings members={context.members} viewerId={context.userId} avatars={new Map(avatars)} />
      <ChatRoom messages={messages} userId={context.userId} />
    </div>
  );
}
