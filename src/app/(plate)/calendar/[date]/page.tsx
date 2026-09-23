import { notFound, redirect } from "next/navigation";
import { DailyCard } from "@/components/daily-card";
import { PageHeader } from "@/components/plate";
import { formatStampDate } from "@/lib/challenge";
import { challengeDayNumber, challengeMilestones } from "@/lib/challenge-dates";
import { loadAppContext, loadDay, signedUrl } from "@/lib/data";

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");
  if (date < context.challenge.start_date || date > context.challenge.end_date) notFound();

  const day = await loadDay(context.challenge.id, date);
  const avatars = new Map(
    await Promise.all(
      context.members.map(async (member) => [
        member.profile.id,
        await signedUrl(member.profile.avatar_path, "avatars"),
      ] as const),
    ),
  );
  const dayNumber = challengeDayNumber(date, context.challenge.start_date);
  const milestone = challengeMilestones(context.challenge.start_date, context.challenge.end_date).find(
    (item) => item.iso === date,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={formatStampDate(date)}
        backHref="/calendar"
        backLabel="Calendar"
        kicker={
          <>
            Day {dayNumber}
            {milestone ? ` · ${milestone.label}` : ""}
          </>
        }
      />
      {context.members.map((member) => {
        const checkin = day.checkins.find((row) => row.user_id === member.profile.id);
        if (!checkin) {
          return (
            <p key={member.profile.id} className="text-sm text-steel">
              No inspection recorded for {member.profile.id === context.userId ? "you" : member.profile.display_name} on this date.
            </p>
          );
        }
        return (
          <DailyCard
            key={member.profile.id}
            checkin={checkin}
            owner={member.profile}
            viewerId={context.userId}
            likes={day.likes.filter((like) => like.daily_checkin_id === checkin.id)}
            comments={day.comments.filter((comment) => comment.daily_checkin_id === checkin.id)}
            canEdit={member.profile.id === context.userId && date === context.today && !checkin.finalized_at}
            avatarUrl={avatars.get(member.profile.id) ?? null}
            challengeStats={member.stats}
          />
        );
      })}
    </div>
  );
}
