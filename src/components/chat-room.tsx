"use client";

import { useState } from "react";
import { sendChatAction } from "@/lib/actions/chat";
import { Button, Field, Plate, TextArea } from "@/components/plate";
import { useSocialNotices } from "@/components/social-notices-provider";
import { useToast } from "@/components/toast";
import { usePlatePending } from "@/components/route-progress";
import { asSystemMessage, dayCompleteLabel } from "@/lib/chat-system";
import type { ChatMessage, Profile } from "@/lib/supabase/types";

export type ChatRow = ChatMessage & { author?: Profile };

export function ChatRoom({ messages, userId }: { messages: ChatRow[]; userId: string }) {
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
            <li className="text-sm leading-6 text-steel">No stamps in this room yet.</li>
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
                        <p className="stamp text-[11px] text-success">Challenge update</p>
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
    </div>
  );
}
