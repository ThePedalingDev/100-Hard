import { describe, expect, it } from "vitest";
import { dayCompleteBody, messageChallengeDate } from "./chat-system";
import type { ChatMessage } from "./supabase/types";

function row(partial: Partial<ChatMessage> & Pick<ChatMessage, "body" | "created_at">): ChatMessage {
  return {
    id: "1",
    challenge_id: "c",
    user_id: "u",
    ...partial,
  };
}

describe("messageChallengeDate", () => {
  it("puts a normal message on the Johannesburg calendar day", () => {
    const message = row({
      body: "Still up",
      created_at: "2026-09-22T22:30:00.000Z",
    });
    expect(messageChallengeDate(message)).toBe("2026-09-23");
  });

  it("keeps a day-complete notice on the day it names", () => {
    const message = row({
      body: dayCompleteBody("2026-09-22"),
      created_at: "2026-09-22T22:05:00.000Z",
    });
    expect(messageChallengeDate(message)).toBe("2026-09-22");
  });
});
