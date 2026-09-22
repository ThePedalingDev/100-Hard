import { redirect } from "next/navigation";
import { ChatRoom } from "@/components/chat-room";
import { PageHeader } from "@/components/plate";
import { loadAppContext, loadChat } from "@/lib/data";

export default async function SocialPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const messages = await loadChat(context.challenge.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Social" kicker={context.challenge.name} />
      <ChatRoom messages={messages} userId={context.userId} />
    </div>
  );
}
