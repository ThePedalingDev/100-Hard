import { redirect } from "next/navigation";
import { PhotoUpload } from "@/components/photo-upload";
import { Plate } from "@/components/plate";
import { monthLabel } from "@/lib/challenge";
import { loadAppContext, loadPhotos, signedUrl } from "@/lib/data";

export default async function PhotosPage() {
  const context = await loadAppContext();
  if (!context) redirect("/login");
  if (!context.challenge) redirect("/onboarding/challenge");

  const photos = await loadPhotos(context.challenge.id);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="stamp text-[32px] leading-none">Progress plates</h1>
        <p className="mt-2 text-sm text-steel">Optional. Private. One official photo each calendar month.</p>
      </header>
      <PhotoUpload month={context.today} />
      <div className="space-y-4">
        {photos.length === 0 ? (
          <Plate>
            <p className="text-sm text-steel">No monthly plates yet. Upload when you want a record, not a score.</p>
          </Plate>
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
                <p className="stamp text-[14px]">{monthLabel(photo.month)}</p>
                <p className="mt-1 text-sm text-steel">{owner}</p>
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="mt-3 w-full border border-steel/30 object-cover" />
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
