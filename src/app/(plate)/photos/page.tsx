import { redirect } from "next/navigation";
import { EmptyPlate } from "@/components/art";
import { PhotoUpload } from "@/components/photo-upload";
import { PageHeader, Plate } from "@/components/plate";
import { monthLabel } from "@/lib/challenge";
import { loadAppContext, loadPhotos, signedUrl } from "@/lib/data";

export default async function PhotosPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const photos = await loadPhotos(context.challenge.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Progress plates"
        kicker="Optional. Private. One official photo each calendar month."
      />
      <PhotoUpload month={context.today} />
      <div className="flex flex-col gap-4">
        {photos.length === 0 ? (
          <figure className="flex flex-col items-center">
            <EmptyPlate />
            <figcaption className="mt-3 text-center text-sm leading-6 text-steel">
              No monthly plates yet. Upload when you want a record, not a score.
            </figcaption>
          </figure>
        ) : null}
        {await Promise.all(
          photos.map(async (photo) => {
            const url = await signedUrl(photo.storage_path, "progress");
            const owner =
              photo.user_id === context.userId
                ? context.profile?.display_name
                : context.partner?.display_name;
            return (
              <Plate key={photo.id} as="article">
                <p className="stamp text-[16px] leading-none">{monthLabel(photo.month)}</p>
                <p className="mt-2 text-sm leading-6 text-steel">{owner}</p>
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="mt-4 w-full rounded-plate border border-steel/30 object-cover" />
                ) : (
                  <p className="mt-3 text-sm text-failure">Could not open this photo.</p>
                )}
                {photo.caption ? <p className="mt-2 text-sm">{photo.caption}</p> : null}
              </Plate>
            );
          }),
        )}
      </div>
    </div>
  );
}
