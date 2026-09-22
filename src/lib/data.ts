import { createClient } from "@/lib/supabase/server";
import {
  CHALLENGE_END,
  CHALLENGE_START,
  addDays,
  dateInChallengeTz,
  daysRemaining,
  isChallengeComplete,
  raceLaneProgress,
} from "@/lib/challenge";
import {
  completedCategories,
  completionPercent,
  currentStreak,
  longestStreak,
  type CheckinFields,
} from "@/lib/scoring";
import type {
  Challenge,
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

export type AppContext = {
  userId: string;
  email: string | undefined;
  profile: Profile | null;
  challenge: Challenge | null;
  partner: Profile | null;
  today: string;
  remaining: number;
  finished: boolean;
  schemaReady: boolean;
  loadError?: string;
  me: MemberView | null;
  other: MemberView | null;
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

function statsFor(
  userId: string,
  checkins: DailyCheckin[],
  spoons: SpoonEntry[],
  today: string,
) {
  const mine = checkins.filter((row) => row.user_id === userId);
  const perfectDays = mine.filter((row) => row.status === "perfect").length;
  const completed = mine.reduce((sum, row) => sum + completedCategories(row), 0);
  const possible = mine.length * 4;
  return {
    perfectDays,
    completion: completionPercent(completed, possible),
    streak: currentStreak(
      mine.map((row) => ({ date: row.challenge_date, status: row.status })),
      today,
    ),
    longest: longestStreak(mine.map((row) => ({ date: row.challenge_date, status: row.status }))),
    spoons: spoonBalance(spoons, userId),
  };
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function resolveChallengeId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const loadMembership = () =>
    supabase
      .from("challenge_members")
      .select("challenge_id")
      .eq("user_id", userId)
      .order("joined_at", { ascending: false })
      .limit(1);

  let { data: memberships } = await loadMembership();
  let challengeId = memberships?.[0]?.challenge_id ?? null;

  if (!challengeId) {
    const { data: owned } = await supabase
      .from("challenges")
      .select("id")
      .eq("created_by", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    challengeId = owned?.[0]?.id ?? null;

    if (!challengeId) {
      ({ data: memberships } = await loadMembership());
      challengeId = memberships?.[0]?.challenge_id ?? null;
    }
  }

  return challengeId;
}

export async function loadAppContext(): Promise<AppContext | null> {
  try {
    return await loadAppContextInner();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load challenge data.";
    const { user } = await requireUser().catch(() => ({ user: null }));
    if (!user) return null;
    const today = dateInChallengeTz();
    return {
      userId: user.id,
      email: user.email,
      profile: null,
      challenge: null,
      partner: null,
      today,
      remaining: daysRemaining(today),
      finished: isChallengeComplete(today),
      schemaReady: true,
      loadError: message,
      me: null,
      other: null,
    };
  }
}

async function loadAppContextInner(): Promise<AppContext | null> {
  const { supabase, user } = await requireUser();
  if (!user) return null;

  const today = dateInChallengeTz();
  const remaining = daysRemaining(today);
  const finished = isChallengeComplete(today);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError && /could not find the table|schema cache/i.test(profileError.message)) {
    return {
      userId: user.id,
      email: user.email,
      profile: null,
      challenge: null,
      partner: null,
      today,
      remaining,
      finished,
      schemaReady: false,
      me: null,
      other: null,
    };
  }

  const resolvedChallengeId = await resolveChallengeId(supabase, user.id);

  if (!resolvedChallengeId) {
    return {
      userId: user.id,
      email: user.email,
      profile: profile as Profile | null,
      challenge: null,
      partner: null,
      today,
      remaining,
      finished,
      schemaReady: true,
      me: null,
      other: null,
    };
  }

  const challengeId = resolvedChallengeId;

  await supabase.rpc("finalize_challenge_day", { target_date: addDays(today, -1) });

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  const { data: members } = await supabase
    .from("challenge_members")
    .select("user_id")
    .eq("challenge_id", challengeId);

  const memberIds = (members ?? []).map((row) => row.user_id);
  const { data: profiles } = await supabase.from("profiles").select("*").in("id", memberIds);
  const partner = (profiles ?? []).find((row) => row.id !== user.id) as Profile | undefined;

  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("challenge_id", challengeId)
    .gte("challenge_date", CHALLENGE_START)
    .lte("challenge_date", today < CHALLENGE_END ? today : CHALLENGE_END);

  const { data: spoons } = await supabase
    .from("spoon_entries")
    .select("*")
    .eq("challenge_id", challengeId);

  const todayCheckins = (checkins ?? []).filter((row) => row.challenge_date === today);
  const checkinIds = todayCheckins.map((row) => row.id);

  const { data: likes } = checkinIds.length
    ? await supabase.from("daily_likes").select("*").in("daily_checkin_id", checkinIds)
    : { data: [] as DailyLike[] };
  const { data: comments } = checkinIds.length
    ? await supabase.from("daily_comments").select("*").in("daily_checkin_id", checkinIds)
    : { data: [] as DailyComment[] };

  const typedCheckins = (checkins ?? []) as DailyCheckin[];
  const typedSpoons = (spoons ?? []) as SpoonEntry[];
  const typedLikes = (likes ?? []) as DailyLike[];
  const typedComments = (comments ?? []) as DailyComment[];

  function viewFor(profileRow: Profile): MemberView {
    const existing = todayCheckins.find((row) => row.user_id === profileRow.id) as DailyCheckin | undefined;
    const checkin = existing ?? emptyCheckin(challengeId, profileRow.id, today);
    return {
      profile: profileRow,
      checkin,
      likes: typedLikes.filter((like) => like.daily_checkin_id === checkin.id),
      comments: typedComments.filter((comment) => comment.daily_checkin_id === checkin.id),
      stats: statsFor(profileRow.id, typedCheckins, typedSpoons, today),
    };
  }

  const meProfile = (profiles ?? []).find((row) => row.id === user.id) as Profile | undefined;

  return {
    userId: user.id,
    email: user.email,
    profile: (profile as Profile | null) ?? meProfile ?? null,
    challenge: challenge as Challenge | null,
    partner: partner ?? null,
    today,
    remaining,
    finished,
    schemaReady: true,
    me: meProfile ? viewFor(meProfile) : null,
    other: partner ? viewFor(partner) : null,
  };
}

export function lanePercent(perfectDays: number): number {
  return Math.round(raceLaneProgress(perfectDays) * 100);
}

export function asFields(checkin: DailyCheckin): CheckinFields {
  return checkin;
}

export async function loadMonth(challengeId: string, month: string) {
  const supabase = await createClient();
  const start = month.slice(0, 7) + "-01";
  const endDate = new Date(`${start}T00:00:00Z`);
  endDate.setUTCMonth(endDate.getUTCMonth() + 1);
  endDate.setUTCDate(0);
  const end = endDate.toISOString().slice(0, 10);

  const { data } = await supabase
    .from("daily_checkins")
    .select("user_id, challenge_date, status")
    .eq("challenge_id", challengeId)
    .gte("challenge_date", start)
    .lte("challenge_date", end);

  return (data ?? []) as Array<Pick<DailyCheckin, "user_id" | "challenge_date" | "status">>;
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

export async function loadCheckin(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("daily_checkins").select("*").eq("id", id).maybeSingle();
  return (data as DailyCheckin | null) ?? null;
}

export async function signedUrl(path: string | null, bucket: "avatars" | "progress") {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
