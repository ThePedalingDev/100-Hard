# Group Challenges, Dates, and Social Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user belong to many challenges (up to 12 members each), pick start and end dates, inspect members from Profile, create a new challenge from Profile, race on a group leaderboard, and talk in a per-challenge chat.

**Architecture:** Keep Next.js App Router + Server Actions + Supabase RLS. One `profiles.active_challenge_id` selects the challenge that Home, Calendar, Photos, Social, and Spoons read. Schema lift of the 2-member trigger, member cap 12, `chat_messages`, and date writes on create. UI stays the load-rating plate world.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind 4, Supabase Postgres/RLS/Realtime, Server Actions returning `{ ok, next }`. Flagged new test dep: Vitest.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-22-group-challenges-social-design.md` (approved).
- Timezone is always `Africa/Johannesburg`; not user-editable.
- Start ≥ SAST today; end > start; no one-day challenges.
- Member cap is 12, not 2.
- Chat: one room per active challenge, body 1–500 chars, no edit/delete/DMs/attachments.
- Create/join actions must return `{ ok, next }` and must not `redirect()` inside `startTransition` (React #441).
- API/action errors: `{ error, code }` via `ActionResult`.
- No gradients, neon, glow, glass; 8px plates; stamp type.
- Do not commit unless the owner explicitly asks in this session; skip commit steps and continue.
- Apply SQL only from `supabase/proposed/002_groups_chat.sql` after it is written; owner already authorized this schema.

## File map

- Create: `supabase/proposed/002_groups_chat.sql`
- Create: `src/lib/challenge-dates.ts` (pure date validation; keep `src/lib/challenge.ts` as TZ/format helpers that take start/end)
- Create: `src/lib/challenge-dates.test.ts`
- Create: `src/lib/actions/chat.ts`
- Create: `src/components/leaderboard.tsx` (replaces two-person `head-to-head.tsx` usage)
- Create: `src/components/challenge-roster.tsx`
- Create: `src/components/chat-room.tsx`
- Create: `src/app/(plate)/social/page.tsx`
- Modify: `src/lib/challenge.ts` — date helpers take `startDate`/`endDate`
- Modify: `src/lib/supabase/types.ts` — `active_challenge_id`, `ChatMessage`
- Modify: `src/lib/data.ts` — `members: MemberView[]`, `memberships`, drop partner-only assumption
- Modify: `src/lib/actions/challenge.ts` — dates, cap 12, set active, no redirect
- Modify: `src/lib/actions/spoons.ts` — active challenge + debtor must owe spoons
- Modify: `src/app/onboarding/challenge/page.tsx` — start/end fields
- Modify: `src/app/(plate)/profile/page.tsx` — roster + Create challenge
- Modify: `src/app/(plate)/dashboard/page.tsx` — leaderboard
- Modify: `src/app/(plate)/calendar/page.tsx` — per-challenge range
- Modify: `src/app/(plate)/spoons/page.tsx` + `src/components/repayment-board.tsx` — member picker
- Modify: `src/components/nav.tsx` — Social item
- Modify: `src/components/realtime-refresh.tsx` — subscribe to `chat_messages`
- Modify: `PRODUCT.md` — many challenges, cap 12, dates, chat
- Flagged: add `vitest` as a devDependency for the date tests

---

### Task 1: Schema 002_groups_chat

**Files:**
- Create: `supabase/proposed/002_groups_chat.sql`
- Modify: `src/lib/supabase/types.ts`

**Interfaces:**
- Consumes: existing `private.is_challenge_member(uuid)`
- Produces: `profiles.active_challenge_id`, `chat_messages`, member cap 12, types `ChatMessage` and `Profile.active_challenge_id`

- [ ] **Step 1: Write the migration SQL**

```sql
-- 002_groups_chat.sql
-- Owner approved 2026-09-22. Apply to remote 100-Hard.

drop trigger if exists challenge_members_cap on public.challenge_members;
drop function if exists private.enforce_two_members();

create or replace function private.enforce_member_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.challenge_members where challenge_id = new.challenge_id) >= 12 then
    raise exception 'challenge_full';
  end if;
  return new;
end;
$$;

create trigger challenge_members_cap
  before insert on public.challenge_members
  for each row execute function private.enforce_member_cap();

alter table public.profiles
  add column if not exists active_challenge_id uuid references public.challenges(id) on delete set null;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_challenge_created
  on public.chat_messages (challenge_id, created_at);

alter table public.chat_messages enable row level security;

create policy chat_messages_select_member on public.chat_messages
  for select using (private.is_challenge_member(challenge_id));

create policy chat_messages_insert_own on public.chat_messages
  for insert with check (
    user_id = auth.uid()
    and private.is_challenge_member(challenge_id)
  );

alter publication supabase_realtime add table public.chat_messages;
```

If `alter publication` fails because the table is already added, leave the rest applied.

- [ ] **Step 2: Extend TypeScript types**

Add to `Profile`:

```ts
active_challenge_id: string | null;
```

Add:

```ts
export type ChatMessage = {
  id: string;
  challenge_id: string;
  user_id: string;
  body: string;
  created_at: string;
};
```

Register `chat_messages` on `Database["public"]["Tables"]`. Update profiles Row/Insert/Update to include `active_challenge_id`.

- [ ] **Step 3: Apply the SQL on the remote 100-Hard project**

Use the configured Supabase MCP `apply_migration` (or equivalent) with name `002_groups_chat` and the file contents. Do not invent a second schema. If MCP is unavailable, stop and tell the owner the SQL is ready in `supabase/proposed/002_groups_chat.sql`.

- [ ] **Step 4: Skip commit unless the owner asked**

---

### Task 2: Date helpers, tests, create form

**Files:**
- Create: `src/lib/challenge-dates.ts`
- Create: `src/lib/challenge-dates.test.ts`
- Modify: `src/lib/challenge.ts`
- Modify: `src/lib/actions/challenge.ts`
- Modify: `src/app/onboarding/challenge/page.tsx`
- Modify: `package.json` (flagged: add `vitest`)

**Interfaces:**
- Consumes: `dateInChallengeTz()` from `src/lib/challenge.ts`
- Produces:
  - `MAX_CHALLENGE_MEMBERS = 12`
  - `validateChallengeRange(start: string, end: string, today: string): ActionResult`
  - `isChallengeComplete(endDate: string, today?: string): boolean`
  - `daysRemainingFor(startDate: string, endDate: string, today?: string): number`
  - `clampToChallengeRange(iso: string, startDate: string, endDate: string): string`
  - `createChallengeAction` reads `start_date` and `end_date` from FormData

- [ ] **Step 1: Flag and add Vitest**

Add devDependency `vitest`. Add script `"test": "vitest run"`. Do not add other libraries.

- [ ] **Step 2: Write failing tests**

`src/lib/challenge-dates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  clampToChallengeRange,
  daysRemainingFor,
  isChallengeComplete,
  validateChallengeRange,
} from "./challenge-dates";

describe("validateChallengeRange", () => {
  it("rejects start before today", () => {
    const result = validateChallengeRange("2026-01-01", "2026-12-31", "2026-09-22");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("START_IN_PAST");
  });

  it("rejects end on start day", () => {
    const result = validateChallengeRange("2026-09-22", "2026-09-22", "2026-09-22");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("END_NOT_AFTER_START");
  });

  it("accepts start today and later end", () => {
    const result = validateChallengeRange("2026-09-22", "2026-12-31", "2026-09-22");
    expect(result.ok).toBe(true);
  });
});

describe("range helpers", () => {
  it("reports complete after end", () => {
    expect(isChallengeComplete("2026-12-31", "2027-01-01")).toBe(true);
  });

  it("clamps iso into range", () => {
    expect(clampToChallengeRange("2026-01-01", "2026-09-22", "2026-12-31")).toBe("2026-09-22");
  });

  it("counts remaining inclusive through end", () => {
    expect(daysRemainingFor("2026-09-22", "2026-09-24", "2026-09-23")).toBe(2);
  });
});
```

- [ ] **Step 3: Run tests, expect FAIL**

Run: `npx vitest run src/lib/challenge-dates.test.ts`

Expected: FAIL, module not found.

- [ ] **Step 4: Implement helpers**

`src/lib/challenge-dates.ts`:

```ts
import { compareIsoDates, daysBetweenInclusive } from "@/lib/challenge";
import type { ActionResult } from "@/lib/supabase/types";

export const MAX_CHALLENGE_MEMBERS = 12;

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function validateChallengeRange(
  start: string,
  end: string,
  today: string,
): ActionResult {
  if (!ISO.test(start) || !ISO.test(end)) {
    return { ok: false, error: "Use calendar dates.", code: "VALIDATION" };
  }
  if (compareIsoDates(start, today) < 0) {
    return { ok: false, error: "Start must be today or later.", code: "START_IN_PAST" };
  }
  if (compareIsoDates(end, start) <= 0) {
    return { ok: false, error: "End must be after start.", code: "END_NOT_AFTER_START" };
  }
  return { ok: true, data: undefined };
}

export function isChallengeComplete(endDate: string, today: string): boolean {
  return compareIsoDates(today, endDate) > 0;
}

export function clampToChallengeRange(iso: string, startDate: string, endDate: string): string {
  if (compareIsoDates(iso, startDate) < 0) return startDate;
  if (compareIsoDates(iso, endDate) > 0) return endDate;
  return iso;
}

export function daysRemainingFor(startDate: string, endDate: string, today: string): number {
  if (isChallengeComplete(endDate, today)) return 0;
  if (compareIsoDates(today, startDate) < 0) return daysBetweenInclusive(startDate, endDate);
  return daysBetweenInclusive(today, endDate);
}
```

Keep `dateInChallengeTz` in `src/lib/challenge.ts`. Change existing `isChallengeComplete()` / `daysRemaining()` / `clampToChallenge()` callers in later tasks; in this task only add the parameterized helpers so tests pass. Leave old helpers temporarily if needed, but prefer switching call sites in Tasks 3–6.

- [ ] **Step 5: Run tests, expect PASS**

Run: `npx vitest run src/lib/challenge-dates.test.ts`

Expected: PASS, 5 tests.

- [ ] **Step 6: Wire create action and onboarding fields**

`createChallengeAction`:

```ts
const today = dateInChallengeTz();
const start = String(formData.get("start_date") ?? "").trim();
const end = String(formData.get("end_date") ?? "").trim();
const dates = validateChallengeRange(start, end, today);
if (!dates.ok) return dates;
// insert start_date: start, end_date: end
// after member insert, update profiles.active_challenge_id = challenge.id
revalidatePath("/", "layout");
return { ok: true, data: undefined, next: "/dashboard" };
```

Do not call `redirect()`.

Onboarding create form: add

```tsx
<Field label="Start date" htmlFor="start_date">
  <TextInput id="start_date" name="start_date" type="date" required defaultValue={/* SAST today from a small server wrapper or leave empty and required */} />
</Field>
<Field label="End date" htmlFor="end_date">
  <TextInput id="end_date" name="end_date" type="date" required />
</Field>
<p className="text-sm leading-6 text-steel">Timezone Africa/Johannesburg. Start today or later. End after start.</p>
```

Pass today’s ISO from the server page into the client form as `defaultStart` if the page is split; otherwise keep the form in the client and set `defaultValue` via `useEffect` from a `data-today` attribute rendered by a tiny server parent. Simplest: convert `onboarding/challenge/page.tsx` to a server page that renders a client `ChallengeOnboarding` with `today={dateInChallengeTz()}`.

- [ ] **Step 7: Skip commit unless asked**

---

### Task 3: App context is memberships + active challenge

**Files:**
- Modify: `src/lib/data.ts`
- Modify: `src/lib/actions/challenge.ts` (`joinChallengeAction`)
- Modify: `src/lib/actions/spoons.ts` (membership lookup)

**Interfaces:**
- Consumes: `profiles.active_challenge_id`, `MAX_CHALLENGE_MEMBERS`
- Produces:

```ts
export type MembershipSummary = {
  challenge: Challenge;
  members: Array<{ profile: Profile; stats: MemberView["stats"] }>;
};

export type AppContext = {
  userId: string;
  email: string | undefined;
  profile: Profile | null;
  challenge: Challenge | null; // the active one
  memberships: MembershipSummary[];
  members: MemberView[]; // active challenge members, ranked later by UI
  today: string;
  remaining: number;
  finished: boolean;
  schemaReady: boolean;
  loadError?: string;
  me: MemberView | null;
};
```

Remove `partner` and `other` from `AppContext`. Pages that still say partner must use `members.filter(m => m.profile.id !== userId)` in later tasks.

- [ ] **Step 1: Rewrite `loadAppContextInner` membership load**

1. Load all `challenge_members` for `user.id` (not `maybeSingle()`).
2. Load those challenges.
3. Resolve active: `profile.active_challenge_id` if it is in that set; else the membership with latest `joined_at`; else null → existing onboarding redirects.
4. Load all members of the active challenge, their profiles, today’s check-ins, likes, comments, stats using each challenge’s `start_date`/`end_date` for remaining/finished.
5. If `active_challenge_id` was stale, write the fallback id back onto the profile.

- [ ] **Step 2: Join action**

- Cap `(count ?? 0) >= MAX_CHALLENGE_MEMBERS` with error `This challenge is full.` / `CHALLENGE_FULL`.
- If already a member, still set active to that challenge and return `{ ok: true, next: "/dashboard" }` (do not insert a duplicate).
- Set `profiles.active_challenge_id`.
- Status `active` when member count ≥ 2 (keep current behavior) or leave pending until 2; do not require 2 before using the challenge. Set status `active` on first create as well if you prefer one rule: `pending` until start date, `active` from start through end, `complete` after end. Implement: `pending` if today < start, `complete` if today > end, else `active`.
- Return `{ ok: true, next: "/dashboard" }`, no `redirect()`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`

Expected: errors only at remaining `context.partner` / `context.other` call sites. Fix those in Tasks 4–7, or fix compile with temporary `members[1]` only if tsc blocks the branch; prefer fixing all partner references in this task so `tsc` is clean:

- `dashboard/page.tsx`
- `calendar/page.tsx` and `[date]/page.tsx`
- `photos/page.tsx`
- `spoons/page.tsx`
- `repayment-board.tsx`

Until Task 5, dashboard may render `members` in a simple list.

- [ ] **Step 4: Skip commit unless asked**

---

### Task 4: Profile locker + Create challenge

**Files:**
- Create: `src/components/challenge-roster.tsx`
- Create: `src/lib/actions/profile-challenge.ts` (or add `setActiveChallengeAction` to `src/lib/actions/challenge.ts`)
- Modify: `src/app/(plate)/profile/page.tsx`

**Interfaces:**
- Consumes: `AppContext.memberships`
- Produces: `setActiveChallengeAction(challengeId: string): Promise<ActionResult>`  
  Verifies membership, updates `profiles.active_challenge_id`, `revalidatePath("/", "layout")`, returns `{ ok: true, next: "/dashboard" }` or `{ ok: false, code: "NOT_MEMBER" }`.

- [ ] **Step 1: Switch action**

```ts
export async function setActiveChallengeAction(challengeId: string): Promise<ActionResult> {
  // auth, membership check, update active_challenge_id
  // if not a member: { ok: false, error: "You are not in that challenge.", code: "NOT_MEMBER" }
}
```

- [ ] **Step 2: Roster UI**

`challenge-roster.tsx` (client for switch buttons):

- For each membership: plate with stamp name, `formatStampDate(start)` — `formatStampDate(end)`, status stamp, member rows (avatar, display name, perfect days, spoons).
- Active: stamp `Active`. Others: button `Switch to this challenge` calling `setActiveChallengeAction` then `leave("/dashboard", router)` or `router.refresh()`.
- InviteShare on each plate (code copy).

- [ ] **Step 3: Profile page actions**

Above the roster:

```tsx
<div className="flex flex-col gap-2 sm:flex-row">
  <Link href="/onboarding/challenge" className="stamp stamp-press inline-flex min-h-11 items-center justify-center rounded-plate bg-brass px-4 text-[13px] text-onproof">
    Create challenge
  </Link>
  <Link href="/onboarding/challenge#join" className="stamp stamp-press inline-flex min-h-11 items-center justify-center rounded-plate border border-steel/50 px-4 text-[13px]">
    Join with a code
  </Link>
</div>
```

Add `id="join"` on the join plate in onboarding.

Verify: opening `/profile` shows Create challenge without first visiting onboarding.

- [ ] **Step 4: Skip commit unless asked**

---

### Task 5: Group leaderboard on Home

**Files:**
- Create: `src/components/leaderboard.tsx`
- Modify: `src/app/(plate)/dashboard/page.tsx`
- Modify: `src/components/invite-share.tsx` (waiting copy)

**Interfaces:**
- Consumes: `members: MemberView[]`
- Produces: ranked plate, invite while `members.length < MAX_CHALLENGE_MEMBERS`

- [ ] **Step 1: Leaderboard component**

Sort `members` by `stats.perfectDays` desc, then `display_name`. Render stamp rank, name, perfect days, spoons. Highlight `me`.

Copy: waiting plate uses `waiting` text **Waiting for members** when `members.length < 2`; still show InviteShare while `members.length < 12`.

- [ ] **Step 2: Dashboard**

Replace `HeadToHead`. Keep Today cards: `me` plus every other member’s card (not only one partner). Stats plate can show `me.stats` as today.

Header remaining uses `daysRemainingFor(challenge.start_date, challenge.end_date, today)`.

- [ ] **Step 3: Skip commit unless asked**

---

### Task 6: Calendar, photos, spoons use active challenge dates

**Files:**
- Modify: `src/app/(plate)/calendar/page.tsx`
- Modify: `src/app/(plate)/calendar/[date]/page.tsx`
- Modify: `src/app/(plate)/photos/page.tsx`
- Modify: `src/lib/data.ts` (`loadMonth` range already challenge_id; clamp with challenge dates)
- Modify: `src/components/daily-card.tsx` only if it assumes one partner (no change if already per-card)

**Interfaces:**
- Consumes: `context.challenge.start_date`, `end_date`, `members`

- [ ] **Step 1: Calendar bounds**

Replace `CHALLENGE_START` / `CHALLENGE_END` with `context.challenge.start_date` / `end_date`. Prev/next month links and `inChallenge` use those. Day cells: one `StatusMark compact` per member (or two-row initials if more than two — still compact marks, wrap).

- [ ] **Step 2: Day page**

Map `members` to cards, not `me`/`other` only.

- [ ] **Step 3: Photos owner names**

Resolve owner via `members.find` / `memberships`.

- [ ] **Step 4: Skip commit unless asked**

---

### Task 7: Group repayment

**Files:**
- Modify: `src/lib/actions/spoons.ts`
- Modify: `src/components/repayment-board.tsx`
- Modify: `src/app/(plate)/spoons/page.tsx`

**Interfaces:**
- Consumes: `members` with `stats.spoons`
- Produces: debtor `<select>` of members other than self with `spoons > 0`

- [ ] **Step 1: `requestRepaymentAction`**

- Load active challenge from `profiles.active_challenge_id` (fallback latest membership).
- `isChallengeComplete(challenge.end_date, dateInChallengeTz())`. Error copy: `Repayment opens after the challenge ends.` / `CHALLENGE_ACTIVE`.
- Debtor must be another member of that challenge.
- Debtor spoon balance (earned − redeemed) must be > 0. Else `{ ok: false, error: "That member does not owe spoons.", code: "NO_DEBT" }`.
- Do not use `challenge_members.maybeSingle()`.

- [ ] **Step 2: UI**

Pass `debtors: Array<{ id: string; name: string; spoons: number }>` into `RepaymentBoard`. Native `<select>` inside the existing Field, `name="debtor_user_id"`. If no debtors, helper copy: `Nobody owes spoons yet.`

Spoons ledger lists all members’ balances, not two columns only — grid of member balances.

- [ ] **Step 3: Skip commit unless asked**

---

### Task 8: Social chat + nav

**Files:**
- Create: `src/lib/actions/chat.ts`
- Create: `src/components/chat-room.tsx`
- Create: `src/app/(plate)/social/page.tsx`
- Modify: `src/components/nav.tsx`
- Modify: `src/components/icons.tsx` (ChatIcon)
- Modify: `src/components/realtime-refresh.tsx`
- Modify: `src/lib/data.ts` (`loadChat(challengeId: string): Promise<Array<ChatMessage & { author?: Profile }>>`)

**Interfaces:**
- Consumes: active `challenge.id`
- Produces: `sendChatAction(formData: FormData): Promise<ActionResult>` with `body` trimmed 1–500; insert `{ challenge_id, user_id, body }`

- [ ] **Step 1: Chat icon + nav item**

Insert `{ href: "/social", label: "Social", icon: ChatIcon }` between Photos and Spoons.

ChatIcon: 24 stroke speech-plate, same stroke as other icons (no emoji).

- [ ] **Step 2: sendChatAction**

```ts
export async function sendChatAction(formData: FormData): Promise<ActionResult> {
  // auth, active challenge membership
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 1 || body.length > 500) {
    return { ok: false, error: "Write 1 to 500 characters.", code: "VALIDATION" };
  }
  // insert chat_messages
  revalidatePath("/social");
  return { ok: true, data: undefined };
}
```

- [ ] **Step 3: Social page + ChatRoom**

Server page: redirect if no context/challenge. Load messages oldest first. Pass to client `ChatRoom`.

Empty: `No stamps in this room yet.`

Composer: TextArea + Button `Stamp`. `aria-live` on the list. After send, clear field; realtime refresh also picks up others.

- [ ] **Step 4: Realtime**

Add `.on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => router.refresh())` in `RealtimeRefresh`.

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit`  
Expected: exit 0

Run: `npx eslint src/lib/challenge-dates.ts src/lib/actions/chat.ts src/app/(plate)/social/page.tsx src/components/chat-room.tsx src/components/challenge-roster.tsx src/components/leaderboard.tsx`  
Expected: no errors

- [ ] **Step 6: Skip commit unless asked**

---

### Task 9: Product copy

**Files:**
- Modify: `PRODUCT.md`

**Interfaces:**
- Consumes: locked spec
- Produces: PRODUCT.md matching many challenges, cap 12, choosable dates, group leaderboard, chat in MVP (remove chat from “out of MVP”)

- [ ] **Step 1: Update Users, Capabilities, Out of MVP, Operating Context**

Replace “exactly two participants in one private challenge” with: a person may join many private invite-only challenges; each challenge has at most 12 members. Start/end chosen at create. Social nav is the challenge chat. Race is perfect-day leaderboard.

Do not rewrite DESIGN.md’s visual world except a one-line nav count if DESIGN names five items.

- [ ] **Step 2: Skip commit unless asked**

---

## Spec coverage

| Spec item | Task |
|---|---|
| Drop 2-member trigger, cap 12 | 1 |
| `active_challenge_id` | 1, 3 |
| `chat_messages` + RLS + realtime | 1, 8 |
| Start/end validation | 2 |
| Create/join set active, `{ ok, next }` | 2, 3 |
| Profile roster, switch, Create challenge | 4 |
| Leaderboard | 5 |
| Calendar uses challenge dates | 6 |
| Any-member repayment if they owe spoons | 7 |
| Social room + six-item nav | 8 |
| PRODUCT.md | 9 |
| Tests listed in spec | 2 (dates); join cap and repayment checks are action-level — add Vitest for `validateChallengeRange` now; remaining tests are manual against staging unless a later task adds them |

## Manual test after Task 8

1. Profile → Create challenge → set start today, end later → lands on Dashboard as only member, invite copy works.
2. Second and third accounts join with the code.
3. Profile lists the challenge and members; Switch between two challenges changes Home.
4. Thirteenth join shows “This challenge is full.”
5. Calendar does not include days outside that challenge.
6. Social: both members see a stamped message. Non-member of another challenge does not.
7. After end date, repayment select only lists members with spoons > 0.
