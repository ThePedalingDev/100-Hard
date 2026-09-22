"use client";

import { useState } from "react";
import { sendChatAction } from "@/lib/actions/chat";
import { Button, ErrorBanner, Field, Plate, TextArea } from "@/components/plate";
import { usePlatePending } from "@/components/route-progress";
import type { ChatMessage, Profile } from "@/lib/supabase/types";

export type ChatRow = ChatMessage & { author?: Profile };

export function ChatRoom({ messages, userId }: { messages: ChatRow[]; userId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const { pending, start } = usePlatePending();

  return (
    <div className="flex flex-col gap-4">
      <Plate>
        <ul aria-live="polite" className="space-y-4">
          {messages.length === 0 ? (
            <li className="text-sm leading-6 text-steel">No stamps in this room yet.</li>
          ) : (
            messages.map((row) => {
              const mine = row.user_id === userId;
              return (
                <li key={row.id}>
                  <p className="stamp text-[11px] text-steel">
                    {mine ? "You" : row.author?.display_name ?? "Member"}
                  </p>
                  <p className="mt-1 text-sm leading-6">{row.body}</p>
                </li>
              );
            })
          )}
        </ul>
      </Plate>
      <Plate>
        <form
          className="space-y-3"
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;
            const formData = new FormData(event.currentTarget);
            start(async () => {
              setError(null);
              const result = await sendChatAction(formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setBody("");
            });
          }}
        >
          <Field label="Message" htmlFor="body">
            <TextArea
              id="body"
              name="body"
              rows={3}
              required
              maxLength={500}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </Field>
          <Button type="submit" pending={pending} className="w-full">
            Stamp
          </Button>
        </form>
        {error ? <div className="mt-3"><ErrorBanner message={error} /></div> : null}
      </Plate>
    </div>
  );
}
