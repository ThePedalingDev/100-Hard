"use client";

import { useState, useTransition } from "react";
import { uploadPhotoAction } from "@/lib/actions/photos";
import { Button, ErrorBanner, Field, Plate, TextInput } from "@/components/plate";

export function PhotoUpload({ month }: { month: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <Plate>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          start(async () => {
            setError(null);
            const result = await uploadPhotoAction(formData);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        <input type="hidden" name="month" value={month} />
        <Field label="This month's photo" htmlFor="photo">
          <TextInput id="photo" name="photo" type="file" accept="image/*" required />
        </Field>
        <Field label="Caption" htmlFor="caption">
          <TextInput id="caption" name="caption" maxLength={120} />
        </Field>
        {error ? <ErrorBanner message={error} /> : null}
        <Button type="submit" disabled={pending}>
          Stamp this month
        </Button>
      </form>
    </Plate>
  );
}
