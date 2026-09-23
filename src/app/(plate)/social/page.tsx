import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatRoom } from "@/components/chat-room";
import { HistoryDatePicker } from "@/components/history-date-picker";
import { MemberRings } from "@/components/member-rings";
import { PageHeader, Plate } from "@/components/plate";
import { messageChallengeDate } from "@/lib/chat-system";
import { clampToChallengeRange } from "@/lib/challenge-dates";
import { loadAppContext, loadChat, loadDay, signedUrl } from "@/lib/data";

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const params = await searchParams;
  const start = context.challenge.start_date;
  const latest = clampToChallengeRange(context.today, start, context.challenge.end_date);
  const requested = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : latest;
  const date = clampToChallengeRange(requested, start, latest);

  const [day, messages, avatars] = await Promise.all([
    loadDay(context.challenge.id, date),
    loadChat(context.challenge.id),
    Promise.all(
      context.members.map(async (member) => [
        member.profile.id,
        await signedUrl(member.profile.avatar_path, "avatars"),
      ] as const),
    ),
  ]);

  const checkinByUser = new Map(day.checkins.map((row) => [row.user_id, row]));
  const members = context.members.map((member) => ({
    ...member,
    checkin: checkinByUser.get(member.profile.id) ?? null,
  }));
  const dayMessages = messages.filter((row) => messageChallengeDate(row) === date);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Social" kicker={context.challenge.name} />
      <Plate>
        <HistoryDatePicker path="/social" start={start} max={latest} value={date} />
        {date !== latest ? (
          <Link
            href="/social"
            className="stamp-press mt-4 inline-flex min-h-12 items-center text-[15px] font-bold tracking-[-0.01em] text-mark"
          >
            Back to today
          </Link>
        ) : null}
      </Plate>
      <MemberRings
        members={members}
        viewerId={context.userId}
        avatars={new Map(avatars)}
        date={date}
        isToday={date === context.today}
      />
      <ChatRoom messages={dayMessages} userId={context.userId} canWrite={date === context.today} />
    </div>
  );
}
