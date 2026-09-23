import { redirect } from "next/navigation";
import { EmptyPlate } from "@/components/art";
import { PhotoUpload } from "@/components/photo-upload";
import { ProgressPhotoCard } from "@/components/progress-photo-card";
import { PageHeader } from "@/components/plate";
import { monthKey, monthLabel } from "@/lib/challenge";
import { loadAppContext, loadPhotos, signedUrl } from "@/lib/data";

export default async function PhotosPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const photos = await loadPhotos(context.challenge.id);
  const currentMonth = monthKey(context.today);
  const hasCurrentMonth = photos.some(
    (photo) => photo.user_id === context.userId && photo.month === currentMonth,
  );
  const nameById = new Map(context.members.map((member) => [member.profile.id, member.profile.display_name]));

  const cards = await Promise.all(
    photos.map(async (photo) => ({
      photo,
      url: await signedUrl(photo.storage_path, "progress"),
      owner:
        photo.user_id === context.userId
          ? context.profile?.display_name
          : nameById.get(photo.user_id),
    })),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Progress plates"
        kicker="Optional. Private. One official photo each calendar month."
      />
      {hasCurrentMonth ? null : <PhotoUpload month={context.today} />}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {photos.length === 0 ? (
          <figure className="flex flex-col items-center">
            <EmptyPlate />
            <figcaption className="mt-3 text-center text-sm leading-6 text-steel">
              No monthly plates yet. Upload when you want a record, not a score.
            </figcaption>
          </figure>
        ) : null}
        {cards.map(({ photo, url, owner }) => (
          <ProgressPhotoCard
            key={photo.id}
            id={photo.id}
            monthLabel={monthLabel(photo.month)}
            owner={owner}
            url={url}
            caption={photo.caption}
            canRemove={photo.user_id === context.userId}
          />
        ))}
      </div>
    </div>
  );
}
