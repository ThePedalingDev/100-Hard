# Group challenges, dates, and Social chat

Date: 2026-09-22
Status: approved 2026-09-22
Product: 100 Hard

## Problem

Profile does not show the active challenge or its members. Create-challenge hardcodes 22 September 2026 – 31 December 2026. There is no place for members of a challenge to talk. The shipped MVP assumed exactly one two-person race.

## Locked decisions

- Rebuild in place. One selected challenge at a time drives Home, Calendar, Photos, Social, and Spoons.
- A person may belong to many challenges. A challenge may have many members (cap 12).
- Race is a shared leaderboard of perfect days. One wooden spoon per failed day, visible to the group.
- Any member may request repayment from any other member who owes spoons. Flow stays requested → accepted → completed → confirmed.
- Creator picks start and end. Timezone stays `Africa/Johannesburg` and is displayed, not edited. Start ≥ today (SAST). End > start. One-day challenges are not allowed.
- Social is one group chat room per active challenge. No DMs, threads, or attachments in this pass.
- Check-in history stays Calendar + day plates (existing likes/comments).
- Existing rows keep stored dates. Only new creates use the form.
- Owner authorized schema changes for this work.

## Out of scope

- Public challenges, discovery, or open join without invite code
- Direct messages
- Message edit/delete, reactions, images in chat
- Member roles beyond creator (no admin/moderator model)
- Leaving or deleting a challenge
- Changing dates after create
- More than 12 members
- Wearables, calories, AI coaching

## Data

### Existing (keep, stop assuming two people)

- `challenges.start_date`, `challenges.end_date`, `challenges.timezone`
- `challenge_members` (already one row per user per challenge)
- Daily check-ins, likes, comments, spoons, repayments, photos remain challenge-scoped

### Schema changes (require apply on remote 100-Hard)

1. Drop the trigger/function that rejects `challenge_members` insert when count ≥ 2.
2. Add a check or trigger: a challenge has at most 12 members.
3. `profiles.active_challenge_id uuid null references public.challenges(id)`  
   Must be a challenge the user belongs to, or null. Clearing or switching is an application write after membership check.
4. `public.chat_messages`  
   - `id uuid pk`  
   - `challenge_id uuid not null references challenges(id) on delete cascade`  
   - `user_id uuid not null references auth.users(id) on delete cascade`  
   - `body text not null` (trim, 1–500 chars)  
   - `created_at timestamptz not null default now()`  
   Index `(challenge_id, created_at)`
5. RLS: members of `challenge_id` can select and insert their own messages. No update/delete in v1.
6. Realtime publication for `chat_messages`.
7. Join action and any SQL helper must use the 12 cap, not 2.

`start_date` / `end_date` columns already exist. Create action writes form values after validation. No extra date columns.

## Units

### Active challenge

`loadAppContext` (or successor) loads:

- all memberships for the current user
- the active challenge: `profiles.active_challenge_id` if still a member, else the most recently joined membership, else null (onboarding)

Switching active challenge updates `profiles.active_challenge_id` and revalidates the plate layout.

### Profile locker

Route: `/profile`

- Identity plate: email, avatar, diet form, theme, sign out (unchanged)
- One plate per membership: name, start–end (stamp dates), status, member list (avatar, display name, perfect-day count, spoons), invite copy if the user is a member
- The active challenge is stamped Active with a control to keep it active; others have Switch to this challenge
- Primary action **Create challenge** (and a Join with code control) on Profile, both going to `/onboarding/challenge`. Creating a challenge must be possible from Profile, not only first-run onboarding.

### Onboarding create/join

Route: `/onboarding/challenge`

- Create: name, start date, end date. Helper line: timezone Africa/Johannesburg.
- Validate server-side: start ≥ SAST today, end > start, name non-empty (default still `100 Hard` if blank).
- On success: insert challenge + membership, set `active_challenge_id`, go to Dashboard.
- Join: invite code. Reject if invalid, already a member, or member count is 12. On success set active and go to Dashboard.

### Home leaderboard

Replace the two-lane rack with a ranked plate of all members of the active challenge, ordered by perfect days descending, then name. Spoons shown as proof marks. Copyable invite remains while count < 12. Empty partner copy becomes Waiting for members.

### Social

New nav item. Route: `/social`

- Only the active challenge room
- List messages oldest → newest, author stamp + time + body
- Composer, 500 character max
- Realtime append
- Empty: “No stamps in this room yet.”
- Unauthenticated or no active challenge: redirect as other plate routes do

Nav (six items): Home, Calendar, Photos, Social, Spoons, Profile.

### Repayment

Debtor picker: members of the active challenge other than self with spoon balance > 0. Same status machine as today.

### Calendar, photos, spoons, daily cards

No new screens. They already take `challenge_id` from context; context must be the active challenge. Date bounds for the calendar use that challenge’s `start_date` and `end_date`, not the hardcoded constants.

## Errors

- Create with start in the past or end ≤ start: validation error, stay on form
- Join at cap 12: “This challenge is full.”
- Chat empty body or > 500: validation error, no insert
- Switch to a challenge you left or never joined: reject, keep previous active
- Chat RLS failure: same generic plate error shape `{ error, code }`

## Testing

- Create with valid dates writes those dates and sets active
- Second and third join succeed; thirteenth fails
- Profile lists two memberships and Switch changes dashboard members
- Calendar refuses dates outside that challenge’s range
- Chat insert visible to another member of the same challenge, not to a non-member
- Repayment request to a member with 0 spoons is rejected

## Product docs to update when implementing

- `PRODUCT.md`: many challenges, cap 12, choosable dates, group leaderboard, chat in MVP
- `DESIGN.md`: Social plate and six-item nav only if the visual world needs new components; keep the load-rating plate language
