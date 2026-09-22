"use client";

import { useRouter } from "next/navigation";
import { Button, Field, TextInput } from "@/components/plate";

export function HistoryDatePicker({
  start,
  max,
  value,
}: {
  start: string;
  max: string;
  value: string;
}) {
  const router = useRouter();

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      action="/profile/history"
      onSubmit={(event) => {
        event.preventDefault();
        const next = new FormData(event.currentTarget).get("date");
        if (typeof next === "string" && next) {
          router.push(`/profile/history?date=${next}`);
        }
      }}
    >
      <Field label="Choose a day" htmlFor="date">
        <TextInput
          key={value}
          id="date"
          name="date"
          type="date"
          min={start}
          max={max}
          defaultValue={value}
          required
          onChange={(event) => {
            const next = event.currentTarget.value;
            if (next) router.push(`/profile/history?date=${next}`);
          }}
        />
      </Field>
      <Button type="submit" className="sm:min-w-36">
        View day
      </Button>
    </form>
  );
}