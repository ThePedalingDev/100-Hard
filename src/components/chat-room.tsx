"use client";

import { useState } from "react";
import { sendChatAction } from "@/lib/actions/chat";
import { Button, Field, Plate, TextArea } from "@/components/plate";
import { useSocialNotices } from "@/components/social-notices-provider";
import { useToast } from "@/components/toast";
import { usePlatePending } from "@/components/route-progress";
import { formatShortDate, formatStampClock } from "@/lib/challenge";
import { asSystemMessage, dayCompleteLabel, messageChallengeDate } from "@/lib/chat-system";
import type { ChatMessage, Profile } from "@/lib/supabase/types";

export type ChatRow = ChatMessage & { author?: Profile };

function stampLabel(row: ChatRow) {
  return `${formatShortDate(messageChallengeDate(row))} · ${formatStampClock(row.created_at)}`;
}

export function ChatRoom({
  messages,
  userId,
  canWrite,
}: {
  messages: ChatRow[];
  userId: string;
  canWrite: boolean;
}) {
  const toast = useToast();
  const { dismiss, isDismissed } = useSocialNotices();
  const [body, setBody] = useState("");
  const { pending, start } = usePlatePending();

  const visibleMessages = messages.filter((row) => {
    const system = asSystemMessage(row);
    if (system && row.user_id === userId) return false;
    if (system && isDismissed(row.id)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <Plate>
        <ul aria-live="polite" className="space-y-4">
          {visibleMessages.length === 0 ? (
            <li className="text-sm leading-6 text-steel">No messages on this day.</li>
          ) : (
            visibleMessages.map((row) => {
              const mine = row.user_id === userId;
              const system = asSystemMessage(row);

              if (system) {
                return (
                  <li
                    key={row.id}
                    className="system-chat-notice rounded-plate border border-success/35 bg-success/10 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="stamp text-[11px] text-success">
                          Challenge update · <span className="tabular">{stampLabel(row)}</span>
                        </p>
                        <p className="mt-1 text-sm leading-6">
                          {dayCompleteLabel(row.author?.display_name ?? "A member")}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="tap-target stamp shrink-0 text-[11px] text-steel hover:text-offwhite"
                        onClick={() => dismiss(row.id)}
                      >
                        Clear
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li key={row.id}>
                  <p className="stamp text-[11px] text-steel">
                    {mine ? "You" : row.author?.display_name ?? "Member"}
                    {" · "}
                    <span className="tabular">{stampLabel(row)}</span>
                  </p>
                  <p className="mt-1 text-sm leading-6">{row.body}</p>
                </li>
              );
            })
          )}
        </ul>
      </Plate>
      {canWrite ? (
      <Plate>
        <form
          className="space-y-3"
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;
            const formData = new FormData(event.currentTarget);
            start(async () => {
              const result = await sendChatAction(formData);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              setBody("");
              toast.success("Message stamped");
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
      </Plate>
      ) : (
        <Plate>
          <p className="text-sm leading-6 text-steel">
            This day is closed. Choose today to stamp a new message.
          </p>
        </Plate>
      )}
    </div>
  );
}
