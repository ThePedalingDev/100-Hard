"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function RealtimeRefresh({
  challengeId,
  userId,
}: {
  challengeId?: string;
  userId?: string;
}) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!challengeId) return;

    const refresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        startTransition(() => router.refresh());
      }, 400);
    };

    const supabase = createClient();
    const channel = supabase
      .channel(`challenge-${challengeId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_checkins" }, (payload) => {
        const row = payload.new as { user_id?: string };
        if (userId && row.user_id === userId) return;
        refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_likes" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_comments" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "spoon_entries" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "spoon_repayments" }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, refresh)
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      void supabase.removeChannel(channel);
    };
  }, [challengeId, router, userId]);

  return null;
}
