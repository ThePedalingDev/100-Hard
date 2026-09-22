import type { DayStatus } from "@/lib/challenge";

export type ChallengeStatus = "pending" | "active" | "complete";
export type SpoonType = "earned" | "redeemed" | "adjustment";
export type RepaymentStatus = "requested" | "accepted" | "completed" | "confirmed" | "cancelled";

export type Profile = {
  id: string;
  display_name: string;
  avatar_path: string | null;
  diet_commitment: string | null;
  active_challenge_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Challenge = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  timezone: string;
  created_by: string;
  invite_code: string;
  status: ChallengeStatus;
  created_at: string;
};

export type ChallengeMember = {
  id: string;
  challenge_id: string;
  user_id: string;
  joined_at: string;
};

export type DailyCheckin = {
  id: string;
  challenge_id: string;
  user_id: string;
  challenge_date: string;
  diet_complete: boolean;
  diet_note: string | null;
  workout_1_complete: boolean;
  workout_2_complete: boolean;
  outdoor_complete: boolean;
  workout_note: string | null;
  water_complete: boolean;
  water_note: string | null;
  bible_complete: boolean;
  bible_reference: string | null;
  bible_note: string | null;
  day_note: string | null;
  failure_reason: string | null;
  status: DayStatus;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyLike = {
  id: string;
  daily_checkin_id: string;
  user_id: string;
  created_at: string;
};

export type DailyComment = {
  id: string;
  daily_checkin_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type SpoonEntry = {
  id: string;
  challenge_id: string;
  user_id: string;
  daily_checkin_id: string | null;
  type: SpoonType;
  quantity: number;
  created_at: string;
};

export type SpoonRepayment = {
  id: string;
  challenge_id: string;
  debtor_user_id: string;
  requested_by_user_id: string;
  title: string;
  description: string | null;
  spoon_cost: number;
  status: RepaymentStatus;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  confirmed_at: string | null;
};

export type ProgressPhoto = {
  id: string;
  challenge_id: string;
  user_id: string;
  month: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  challenge_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export type ActionResult<T = undefined> =
  | { ok: true; data: T; next?: string }
  | { ok: false; error: string; code: string };

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; display_name: string }; Update: Partial<Profile> };
      challenges: { Row: Challenge; Insert: Partial<Challenge> & { name: string; start_date: string; created_by: string; invite_code: string }; Update: Partial<Challenge> };
      challenge_members: { Row: ChallengeMember; Insert: Partial<ChallengeMember> & { challenge_id: string; user_id: string }; Update: Partial<ChallengeMember> };
      daily_checkins: { Row: DailyCheckin; Insert: Partial<DailyCheckin> & { challenge_id: string; user_id: string; challenge_date: string }; Update: Partial<DailyCheckin> };
      daily_likes: { Row: DailyLike; Insert: { daily_checkin_id: string; user_id: string }; Update: Partial<DailyLike> };
      daily_comments: { Row: DailyComment; Insert: { daily_checkin_id: string; user_id: string; body: string }; Update: Partial<DailyComment> };
      spoon_entries: { Row: SpoonEntry; Insert: Partial<SpoonEntry> & { challenge_id: string; user_id: string; type: SpoonType; quantity: number }; Update: Partial<SpoonEntry> };
      spoon_repayments: { Row: SpoonRepayment; Insert: Partial<SpoonRepayment> & { challenge_id: string; debtor_user_id: string; requested_by_user_id: string; title: string; spoon_cost: number }; Update: Partial<SpoonRepayment> };
      progress_photos: { Row: ProgressPhoto; Insert: Partial<ProgressPhoto> & { challenge_id: string; user_id: string; month: string; storage_path: string }; Update: Partial<ProgressPhoto> };
      chat_messages: { Row: ChatMessage; Insert: Partial<ChatMessage> & { challenge_id: string; user_id: string; body: string }; Update: Partial<ChatMessage> };
    };
  };
};
