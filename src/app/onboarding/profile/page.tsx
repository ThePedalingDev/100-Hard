"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfileAction, uploadAvatarAction } from "@/lib/actions/profile";
import { AvatarCropper } from "@/components/avatar-cropper";
import { Button, ErrorBanner, Field, Plate, TextArea, TextInput } from "@/components/plate";
import { usePlatePending } from "@/components/route-progress";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, start, leave } = usePlatePending();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  return (
    <main className="auth-shell mx-auto flex max-w-lg items-center">
      <Plate className="w-full">
          <h1 className="text-[32px] leading-none">Stamp your plate</h1>
        <p className="mt-2 text-sm text-steel">
          Display name, picture, and the diet you will be judged against.
        </p>
        <form
          className="mt-6 space-y-4"
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;
            const form = event.currentTarget;
            const formData = textFieldsOnly(new FormData(form));
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
                if (!uploaded.ok) {
                  setError(uploaded.error);
                  return;
                }
              }
              leave("/onboarding/challenge", router);
            });
          }}
        >
          <Field label="Display name" htmlFor="display_name">
            <TextInput id="display_name" name="display_name" required />
          </Field>
          <Field label="Diet commitment" htmlFor="diet_commitment">
            <TextArea
              id="diet_commitment"
              name="diet_commitment"
              rows={3}
              required
              placeholder="Stay within calorie target, no alcohol, no takeaways."
            />
          </Field>
          <div className="space-y-2">
            <p className="stamp text-[11px] text-steel">Profile picture</p>
            <AvatarCropper id="avatar" onFile={setAvatarFile} />
          </div>
          {error ? <ErrorBanner message={error} /> : null}
          <Button type="submit" pending={pending} className="w-full">
            Continue
          </Button>
        </form>
      </Plate>
    </main>
  );
}

function textFieldsOnly(source: FormData) {
  const next = new FormData();
  for (const [key, value] of source.entries()) {
    if (typeof value === "string") next.set(key, value);
  }
  return next;
}
