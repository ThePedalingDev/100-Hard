"use client";

import { useState, useTransition } from "react";
import { saveProfileAction, uploadAvatarAction } from "@/lib/actions/profile";
import { AvatarCropper } from "@/components/avatar-cropper";
import { Button, Field, Plate, TextArea, TextInput } from "@/components/plate";
import { useToast } from "@/components/toast";

export function ProfileForm({
  displayName,
  dietCommitment,
  avatarUrl,
}: {
  displayName: string;
  dietCommitment: string;
  avatarUrl?: string | null;
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  return (
    <Plate>
      <form
        className="space-y-4"
        aria-busy={pending}
        onSubmit={(event) => {
          event.preventDefault();
          if (pending) return;
          const formData = textFieldsOnly(new FormData(event.currentTarget));
          start(async () => {
            const saved = await saveProfileAction(formData);
            if (!saved.ok) {
              toast.error(saved.error);
              return;
            }
            if (avatarFile) {
              const uploadData = new FormData();
              uploadData.set("avatar", avatarFile);
              const uploaded = await uploadAvatarAction(uploadData);
              if (!uploaded.ok) {
                toast.error(uploaded.error);
                return;
              }
            }
            toast.success("Plate saved");
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
        <Button type="submit" pending={pending}>
          Save plate
        </Button>
      </form>
    </Plate>
  );
}

function textFieldsOnly(source: FormData) {
  const next = new FormData();
  for (const [key, value] of source.entries()) {
    if (typeof value === "string") next.set(key, value);
  }
  return next;
}
