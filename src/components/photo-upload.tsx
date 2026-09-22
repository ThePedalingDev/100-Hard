"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageCropper } from "@/components/image-cropper";
import { uploadPhotoAction } from "@/lib/actions/photos";
import { Button, Field, Plate, TextInput } from "@/components/plate";
import { useToast } from "@/components/toast";

export function PhotoUpload({ month }: { month: string }) {
  const router = useRouter();
  const toast = useToast();
  const [photo, setPhoto] = useState<File | null>(null);
  const [pending, start] = useTransition();

  return (
    <Plate>
      <form
        className="space-y-4"
        aria-busy={pending}
        onSubmit={(event) => {
          event.preventDefault();
          if (pending) return;
          if (!photo) {
            toast.error("Crop this month's photo before stamping it.");
            return;
          }
          const formData = new FormData(event.currentTarget);
          formData.set("photo", photo);
          start(async () => {
            const result = await uploadPhotoAction(formData);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Photo stamped");
            router.refresh();
          });
        }}
      >
        <input type="hidden" name="month" value={month} />
        <Field label="This month's photo" htmlFor="photo">
          <ImageCropper
            id="photo"
            aspect="photo"
            fileName="progress.webp"
            emptyLabel="No monthly plate yet"
            hint="Pick a photo, crop it to 4:3, then stamp it. Saved as WebP."
            onFile={setPhoto}
          />
        </Field>
        <Field label="Caption" htmlFor="caption">
          <TextInput id="caption" name="caption" maxLength={120} />
        </Field>
        <Button type="submit" pending={pending}>
          Stamp this month
        </Button>
      </form>
    </Plate>
  );
}
