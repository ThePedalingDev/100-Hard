import { cache } from "react";
import { createMediaSignedUrl, mediaSrc } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { addDays, dateInChallengeTz, raceLaneProgress } from "@/lib/challenge";
import { daysRemainingFor, isChallengeComplete } from "@/lib/challenge-dates";
import {
  completedCategories,
  completionPercent,
  currentStreak,
  longestStreak,
  statsDayStatus,
  type CheckinFields,
} from "@/lib/scoring";
import type {
  Challenge,
  ChatMessage,
  DailyCheckin,
  DailyComment,
  DailyLike,
  Profile,
  ProgressPhoto,
  SpoonEntry,
  SpoonRepayment,
} from "@/lib/supabase/types";

export type MemberView = {
  profile: Profile;
  checkin: DailyCheckin | null;
  likes: DailyLike[];
  comments: DailyComment[];
  stats: {
    perfectDays: number;
    completion: number;
    streak: number;
    longest: number;
    spoons: number;
  };
};

export type MembershipSummary = {
  challenge: Challenge;
  members: Array<{ profile: Profile; stats: MemberView["stats"] }>;
};

export type AppContext = {
  userId: string;
  email: string | undefined;
  profile: Profile | null;
  challenge: Challenge | null;
  memberships: MembershipSummary[];
  members: MemberView[];
  today: string;
  remaining: number;
  finished: boolean;
  schemaReady: boolean;
  loadError?: string;
  me: MemberView | null;
  isAdmin: boolean;
};

function emptyCheckin(challengeId: string, userId: string, date: string): DailyCheckin {
  return {
    id: `local-${userId}-${date}`,
    challenge_id: challengeId,
    user_id: userId,
    challenge_date: date,
    diet_complete: false,
    diet_note: null,
    workout_1_complete: false,
    workout_2_complete: false,
    outdoor_complete: false,
    workout_note: null,
    water_complete: false,
    water_note: null,
    bible_complete: false,
    bible_reference: null,
    bible_note: null,
    day_note: null,
    failure_reason: null,
    status: "pending",
    finalized_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function spoonBalance(entries: SpoonEntry[], userId: string): number {
  return entries
    .filter((entry) => entry.user_id === userId)
    .reduce((sum, entry) => {
      if (entry.type === "earned") return sum + entry.quantity;
      if (entry.type === "redeemed") return sum - entry.quantity;
      return sum + entry.quantity;
    }, 0);
}

function statsFor(userId: string, checkins: StatsCheckin[], spoons: SpoonEntry[], today: string) {
  const mine = checkins.filter((row) => row.user_id === userId);
  const statuses = mine.map((row) => ({
    date: row.challenge_date,
    status: statsDayStatus(row),
  }));
  const perfectDays = statuses.filter((row) => row.status === "perfect").length;
  const completed = mine.reduce((sum, row) => sum + completedCategories(row), 0);
  const possible = mine.length * 4;
  return {
    perfectDays,
    completion: completionPercent(completed, possible),
    streak: currentStreak(statuses, today),
    longest: longestStreak(statuses),
    spoons: spoonBalance(spoons, userId),
  };
}

function baseContext(
  userId: string,
  email: string | undefined,
  today: string,
  extras: Partial<AppContext> = {},
): AppContext {
  return {
    userId,
    email,
    profile: null,
    challenge: null,
    memberships: [],
    members: [],
    today,
    remaining: 0,
    finished: false,
    schemaReady: true,
    me: null,
    isAdmin: isAdminEmail(email),
    ...extras,
  };
}

const CHECKIN_STATS =
  "user_id, challenge_id, challenge_date, status, diet_complete, workout_1_complete, workout_2_complete, outdoor_complete, water_complete, bible_complete, finalized_at";

type StatsCheckin = Pick<
  DailyCheckin,
  | "user_id"
  | "challenge_id"
  | "challenge_date"
  | "status"
  | "diet_complete"
  | "workout_1_complete"
  | "workout_2_complete"
  | "outdoor_complete"
  | "water_complete"
  | "bible_complete"
  | "finalized_at"
>;

export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});

export const loadAppContext = cache(async (): Promise<AppContext | null> => {
  try {
    return await loadAppContextInner();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load challenge data.";
    const { user } = await requireUser().catch(() => ({ user: null }));
    if (!user) return null;
    return baseContext(user.id, user.email, dateInChallengeTz(), { loadError: message });
  }
});

async function maybeFinalizeYesterday(
  supabase: Awaited<ReturnType<typeof createClient>>,
  challenge: Challenge,
  memberIds: string[],
  today: string,
) {
  const yesterday = addDays(today, -1);
  if (memberIds.length === 0 || yesterday < challenge.start_date || yesterday > challenge.end_date) return;

  const { data } = await supabase
    .from("daily_checkins")
    .select("user_id, finalized_at")
    .eq("challenge_id", challenge.id)
    .eq("challenge_date", yesterday)
    .in("user_id", memberIds);

  const rows = data ?? [];
  const finalized = rows.filter((row) => row.finalized_at);
  if (finalized.length >= memberIds.length) return;

  await supabase.rpc("finalize_challenge_day", { target_date: yesterday });
}

async function loadAppContextInner(): Promise<AppContext | null> {
  const { supabase, user } = await requireUser();
  if (!user) return null;

  const today = dateInChallengeTz();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError && /could not find the table|schema cache/i.test(profileError.message)) {
    return baseContext(user.id, user.email, today, { schemaReady: false });
  }

  const typedProfile = (profile as Profile | null) ?? null;

  const { data: myRows } = await supabase
    .from("challenge_members")
    .select("challenge_id, joined_at")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const membershipRows = myRows ?? [];
  const challengeIds = membershipRows.map((row) => row.challenge_id);

  if (challengeIds.length === 0) {
    return baseContext(user.id, user.email, today, { profile: typedProfile });
  }

  const { data: challengeRows } = await supabase.from("challenges").select("*").in("id", challengeIds);
  const challenges = (challengeRows ?? []) as Challenge[];

  let activeId = typedProfile?.active_challenge_id ?? null;
  if (!activeId || !challengeIds.includes(activeId)) {
    activeId = membershipRows[0]?.challenge_id ?? null;
    if (activeId && activeId !== typedProfile?.active_challenge_id) {
      await supabase.from("profiles").update({ active_challenge_id: activeId }).eq("id", user.id);
    }
  }

  const { data: allMemberRows } = await supabase
    .from("challenge_members")
    .select("challenge_id, user_id")
    .in("challenge_id", challengeIds);
  const memberIds = [...new Set((allMemberRows ?? []).map((row) => row.user_id))];
  const { data: profileRows } = await supabase.from("profiles").select("*").in("id", memberIds);
  const profilesById = new Map(((profileRows ?? []) as Profile[]).map((row) => [row.id, row]));

  const { data: allCheckins } = await supabase
    .from("daily_checkins")
    .select(CHECKIN_STATS)
    .in("challenge_id", challengeIds);
  const { data: allSpoons } = await supabase
    .from("spoon_entries")
    .select("id, challenge_id, user_id, type, quantity, daily_checkin_id, created_at")
    .in("challenge_id", challengeIds);
  const typedCheckins = (allCheckins ?? []) as StatsCheckin[];
  const typedSpoons = (allSpoons ?? []) as SpoonEntry[];

  const memberships: MembershipSummary[] = membershipRows.flatMap((row) => {
    const challenge = challenges.find((item) => item.id === row.challenge_id);
    if (!challenge) return [];
    const ids = (allMemberRows ?? [])
      .filter((item) => item.challenge_id === challenge.id)
      .map((item) => item.user_id);
    const checkins = typedCheckins.filter((item) => item.challenge_id === challenge.id);
    const spoons = typedSpoons.filter((item) => item.challenge_id === challenge.id);
    return [
      {
        challenge,
        members: ids
          .map((id) => profilesById.get(id))
          .filter((item): item is Profile => Boolean(item))
          .map((memberProfile) => ({
            profile: memberProfile,
            stats: statsFor(memberProfile.id, checkins, spoons, today),
          })),
      },
    ];
  });

  const challenge = challenges.find((row) => row.id === activeId) ?? null;
  if (!challenge) {
    return baseContext(user.id, user.email, today, { profile: typedProfile, memberships });
  }

  const active = challenge;
  const activeMemberIds = (allMemberRows ?? [])
    .filter((row) => row.challenge_id === active.id)
    .map((row) => row.user_id);

  await maybeFinalizeYesterday(supabase, active, activeMemberIds, today);

  const remaining = daysRemainingFor(active.start_date, active.end_date, today);
  const finished = isChallengeComplete(active.end_date, today);
  const startBound = active.start_date;
  const endBound = today < active.end_date ? today : active.end_date;

  const activeCheckins = typedCheckins.filter(
    (row) =>
      row.challenge_id === active.id &&
      row.challenge_date >= startBound &&
      row.challenge_date <= endBound,
  );
  const activeSpoons = typedSpoons.filter((row) => row.challenge_id === active.id);

  const { data: todayFullRows } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("challenge_id", active.id)
    .eq("challenge_date", today);
  const todayCheckins = (todayFullRows ?? []) as DailyCheckin[];
  const checkinIds = todayCheckins.map((row) => row.id);

  const { data: likes } = checkinIds.length
    ? await supabase.from("daily_likes").select("*").in("daily_checkin_id", checkinIds)
    : { data: [] as DailyLike[] };
  const { data: comments } = checkinIds.length
    ? await supabase.from("daily_comments").select("*").in("daily_checkin_id", checkinIds)
    : { data: [] as DailyComment[] };
  const typedLikes = (likes ?? []) as DailyLike[];
  const typedComments = (comments ?? []) as DailyComment[];

  function viewFor(profileRow: Profile): MemberView {
    const existing = todayCheckins.find((row) => row.user_id === profileRow.id);
    const checkin = existing ?? emptyCheckin(active.id, profileRow.id, today);
    return {
      profile: profileRow,
      checkin,
      likes: typedLikes.filter((like) => like.daily_checkin_id === checkin.id),
      comments: typedComments.filter((comment) => comment.daily_checkin_id === checkin.id),
      stats: statsFor(profileRow.id, activeCheckins, activeSpoons, today),
    };
  }

  const members = activeMemberIds
    .map((id) => profilesById.get(id))
    .filter((row): row is Profile => Boolean(row))
    .map(viewFor);
  const me = members.find((row) => row.profile.id === user.id) ?? null;

  return {
    userId: user.id,
    email: user.email,
    profile: typedProfile ?? me?.profile ?? null,
    challenge,
    memberships,
    members,
    today,
    remaining,
    finished,
    schemaReady: true,
    me,
    isAdmin: isAdminEmail(user.email),
  };
}

export function lanePercent(perfectDays: number, totalDays?: number): number {
  if (totalDays && totalDays > 0) {
    return Math.round(Math.min(perfectDays / totalDays, 1) * 100);
  }
  return Math.round(raceLaneProgress(perfectDays) * 100);
}

export function asFields(checkin: DailyCheckin): CheckinFields {
  return checkin;
}

export async function loadRange(challengeId: string, start: string, end: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_checkins")
    .select("user_id, challenge_date, status")
    .eq("challenge_id", challengeId)
    .gte("challenge_date", start)
    .lte("challenge_date", end);

  return (data ?? []) as Array<Pick<DailyCheckin, "user_id" | "challenge_date" | "status">>;
}

export async function loadMonth(challengeId: string, month: string) {
  const start = month.slice(0, 7) + "-01";
  const endDate = new Date(`${start}T00:00:00Z`);
  endDate.setUTCMonth(endDate.getUTCMonth() + 1);
  endDate.setUTCDate(0);
  const end = endDate.toISOString().slice(0, 10);
  return loadRange(challengeId, start, end);
}

export async function loadDay(challengeId: string, date: string) {
  const supabase = await createClient();
  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("challenge_date", date);

  const ids = (checkins ?? []).map((row) => row.id);
  const { data: likes } = ids.length
    ? await supabase.from("daily_likes").select("*").in("daily_checkin_id", ids)
    : { data: [] };
  const { data: comments } = ids.length
    ? await supabase.from("daily_comments").select("*").in("daily_checkin_id", ids)
    : { data: [] };

  return {
    checkins: (checkins ?? []) as DailyCheckin[],
    likes: (likes ?? []) as DailyLike[],
    comments: (comments ?? []) as DailyComment[],
  };
}

export async function loadUserCheckin(challengeId: string, userId: string, date: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .eq("challenge_date", date)
    .maybeSingle();
  return (data as DailyCheckin | null) ?? null;
}

export async function loadSpoons(challengeId: string) {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("spoon_entries")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false });
  const { data: repayments } = await supabase
    .from("spoon_repayments")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false });
  return {
    entries: (entries ?? []) as SpoonEntry[],
    repayments: (repayments ?? []) as SpoonRepayment[],
  };
}

export async function loadPhotos(challengeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("month", { ascending: false });
  return (data ?? []) as ProgressPhoto[];
}

export async function loadSystemChatNotices(challengeId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("challenge_id", challengeId)
    .neq("user_id", userId)
    .like("body", "[sys:day_complete:%")
    .order("created_at", { ascending: false })
    .limit(30);
  return (data ?? []) as ChatMessage[];
}

export async function loadChat(challengeId: string) {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: true });
  const rows = (messages ?? []) as ChatMessage[];
  const authorIds = [...new Set(rows.map((row) => row.user_id))];
  const { data: authors } = authorIds.length
    ? await supabase.from("profiles").select("*").in("id", authorIds)
    : { data: [] as Profile[] };
  const byId = new Map(((authors ?? []) as Profile[]).map((row) => [row.id, row]));
  return rows.map((row) => ({ ...row, author: byId.get(row.user_id) }));
}

export async function loadCheckin(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("daily_checkins").select("*").eq("id", id).maybeSingle();
  return (data as DailyCheckin | null) ?? null;
}

export async function loadCheckinsByIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, DailyCheckin>();
  const supabase = await createClient();
  const { data } = await supabase.from("daily_checkins").select("*").in("id", ids);
  return new Map(((data ?? []) as DailyCheckin[]).map((row) => [row.id, row]));
}

export { createMediaSignedUrl, mediaSrc, type MediaBucket } from "@/lib/media";

export async function signedUrl(path: string | null, bucket: "avatars" | "progress") {
  if (!path) return null;
  const supabase = await createClient();
  const { data, error } = await createMediaSignedUrl(supabase, path, bucket);
  if (!error && data?.signedUrl) return data.signedUrl;
  return mediaSrc(path, bucket);
}
