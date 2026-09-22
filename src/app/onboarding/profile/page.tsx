"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProfileAction, uploadAvatarAction } from "@/lib/actions/profile";
import { AvatarCropper } from "@/components/avatar-cropper";
import { Button, ErrorBanner, Field, Plate, TextArea, TextInput } from "@/components/plate";
import { ThemeToggle } from "@/components/theme-toggle";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center px-4 py-10">
      <Plate className="w-full">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h1 className="stamp text-[32px] leading-none">Stamp your plate</h1>
          <ThemeToggle />
        </div>
        <p className="mt-2 text-sm text-steel">
          Display name, picture, and the diet you will be judged against.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);
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
              router.push("/onboarding/challenge");
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
          <Button type="submit" disabled={pending} className="w-full">
            Continue
          </Button>
        </form>
      </Plate>
    </main>
  );
}
