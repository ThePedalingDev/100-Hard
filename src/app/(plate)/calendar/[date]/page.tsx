import { notFound, redirect } from "next/navigation";
import { DailyCard } from "@/components/daily-card";
import { formatStampDate } from "@/lib/challenge";
import { loadAppContext, loadDay, signedUrl } from "@/lib/data";

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const day = await loadDay(context.challenge.id, date);
  const meAvatar = await signedUrl(context.profile?.avatar_path ?? null, "avatars");
  const otherAvatar = await signedUrl(context.partner?.avatar_path ?? null, "avatars");

  const mine = day.checkins.find((row) => row.user_id === context.userId);
  const theirs = day.checkins.find((row) => row.user_id !== context.userId);

  return (
    <div className="space-y-5">
      <h1 className="stamp text-[32px] leading-none">{formatStampDate(date)}</h1>
      {context.me && mine ? (
        <DailyCard
          checkin={mine}
          owner={context.me.profile}
          viewerId={context.userId}
          likes={day.likes.filter((like) => like.daily_checkin_id === mine.id)}
          comments={day.comments.filter((comment) => comment.daily_checkin_id === mine.id)}
          canEdit={date === context.today && !mine.finalized_at}
          avatarUrl={meAvatar}
        />
      ) : (
        <p className="text-sm text-steel">No inspection recorded for you on this date.</p>
      )}
      {context.other && theirs ? (
        <DailyCard
          checkin={theirs}
          owner={context.other.profile}
          viewerId={context.userId}
          likes={day.likes.filter((like) => like.daily_checkin_id === theirs.id)}
          comments={day.comments.filter((comment) => comment.daily_checkin_id === theirs.id)}
          canEdit={false}
          avatarUrl={otherAvatar}
        />
      ) : null}
    </div>
  );
}
