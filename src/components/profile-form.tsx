"use client";

import { useState, useTransition } from "react";
import { saveProfileAction, uploadAvatarAction } from "@/lib/actions/profile";
import { AvatarCropper } from "@/components/avatar-cropper";
import { Button, ErrorBanner, Field, Plate, TextArea, TextInput } from "@/components/plate";

export function ProfileForm({
  displayName,
  dietCommitment,
  avatarUrl,
}: {
  displayName: string;
  dietCommitment: string;
  avatarUrl?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  return (
    <Plate>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          start(async () => {
            setError(null);
            const saved = await saveProfileAction(formData);
            if (!saved.ok) {
              setError(saved.error);
              return;
            }
            if (avatarFile) {
              const uploadData = new FormData();
              uploadData.set("avatar", avatarFile);
              const uploaded = await uploadAvatarAction(uploadData);
              if (!uploaded.ok) setError(uploaded.error);
            }
          });
        }}
      >
        <Field label="Display name" htmlFor="display_name">
          <TextInput id="display_name" name="display_name" defaultValue={displayName} required />
        </Field>
        <Field label="Diet commitment" htmlFor="diet_commitment">
          <TextArea id="diet_commitment" name="diet_commitment" rows={3} defaultValue={dietCommitment} required />
        </Field>
        <div className="space-y-2">
          <p className="stamp text-[11px] text-steel">Replace picture</p>
          <AvatarCropper id="avatar" existingUrl={avatarUrl} onFile={setAvatarFile} />
        </div>
        {error ? <ErrorBanner message={error} /> : null}
        <Button type="submit" disabled={pending}>
          Save plate
        </Button>
      </form>
    </Plate>
  );
}
