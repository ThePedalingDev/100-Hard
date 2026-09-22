"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function RealtimeRefresh({ challengeId }: { challengeId?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!challengeId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`challenge-${challengeId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_checkins" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_likes" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_comments" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "spoon_entries" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "spoon_repayments" }, () => router.refresh())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => router.refresh())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [challengeId, router]);

  return null;
}
