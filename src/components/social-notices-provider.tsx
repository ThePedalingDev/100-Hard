"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  asSystemMessage,
  readDismissedIds,
  writeDismissedIds,
  type SystemChatMessage,
} from "@/lib/chat-system";
import type { ChatMessage } from "@/lib/supabase/types";

type SocialNoticesContextValue = {
  unreadCount: number;
  dismiss: (messageId: string) => void;
  isDismissed: (messageId: string) => boolean;
};

const SocialNoticesContext = createContext<SocialNoticesContextValue | null>(null);

export function SocialNoticesProvider({
  userId,
  messages,
  children,
}: {
  userId: string;
  messages: ChatMessage[];
  children: ReactNode;
}) {
  const systemMessages = useMemo(
    () =>
      messages
        .map(asSystemMessage)
        .filter((row): row is SystemChatMessage => row !== null),
    [messages],
  );

  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissedIds(userId));

  const dismiss = useCallback(
    (messageId: string) => {
      setDismissed((current) => {
        const next = new Set(current);
        next.add(messageId);
        writeDismissedIds(userId, next);
        return next;
      });
    },
    [userId],
  );

  const unreadCount = systemMessages.filter((message) => !dismissed.has(message.id)).length;

  const value = useMemo<SocialNoticesContextValue>(
    () => ({
      unreadCount,
      dismiss,
      isDismissed: (messageId: string) => dismissed.has(messageId),
    }),
    [dismiss, dismissed, unreadCount],
  );

  return <SocialNoticesContext.Provider value={value}>{children}</SocialNoticesContext.Provider>;
}

export function useSocialNotices() {
  const context = useContext(SocialNoticesContext);
  if (!context) {
    return {
      unreadCount: 0,
      dismiss: () => undefined,
      isDismissed: () => false,
    };
  }
  return context;
}
