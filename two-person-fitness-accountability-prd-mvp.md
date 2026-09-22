# PRD + MVP — Two-Person Fitness Accountability Challenge

**Document version:** 1.0  
**Product type:** Private two-person accountability web app  
**Challenge end date:** 31 December 2026  
**Primary timezone:** `Africa/Johannesburg`  
**Frontend:** Next.js + TypeScript, deployed on Vercel  
**Backend:** Supabase (Auth, Postgres, Storage, Realtime, RLS, scheduled jobs)  
**UI/UX standard:** Impeccable (`https://impeccable.style`)  
**Target:** Mobile-first responsive web app  

---

## 1. Product Summary

Build a private accountability challenge for exactly two participants.

Each participant completes four scored daily commitments until 31 December 2026:

1. Follow their personal diet commitment.
2. Complete two workouts of at least 45 minutes each, with at least one workout outdoors.
3. Drink at least 3.8 L of water.
4. Complete at least 10 pages of Bible reading.

Each day is classified as:

- `pending` — the day is still active.
- `perfect` — all required commitments are complete.
- `failed` — the day ended with one or more incomplete requirements.

A failed day generates exactly one **wooden spoon** (`🥄`) for that participant, regardless of how many individual requirements were missed.

The product combines:

- daily habit tracking;
- a two-person head-to-head race;
- current streaks;
- perfect-day counts;
- overall completion percentage;
- wooden spoon penalties;
- optional contextual notes for every requirement;
- visible failure reasons;
- likes and comments for accountability;
- optional private monthly progress photos;
- an end-of-challenge summary and wooden-spoon repayment flow.

The application must feel like a **premium gym/performance journal**, not a generic habit tracker or SaaS dashboard.

---

# 2. Product Goals

The core behavioural loop is:

**Complete tasks → check partner → acknowledge progress → maintain streak → advance in the race → avoid wooden spoons**

The product should encourage:

- consistency;
- accountability;
- friendly competition;
- visibility into why a day succeeded or failed;
- meaningful historical reflection at the end of the challenge.

---

# 3. Users and Membership

The MVP supports exactly one challenge with a maximum of two members.

Each member has:

- email;
- display name;
- profile picture;
- personal diet commitment;
- daily progress;
- comments and likes;
- optional monthly progress photos;
- wooden spoon balance.

A third user must not be able to join the same challenge.

---

# 4. Authentication

Use standard Supabase Auth.

## MVP authentication methods

Required:

- email + password;
- login;
- logout;
- password reset.

Optional if simple:

- magic-link login.

Do not build a custom authentication system.

---

# 5. Challenge Lifecycle

## 5.1 Challenge creation

The first participant creates the challenge.

Challenge fields:

- challenge name;
- start date;
- end date;
- timezone;
- invite code or invite link.

For this product:

- end date = `2026-12-31`;
- timezone = `Africa/Johannesburg`.

## 5.2 Joining

The second participant:

1. creates/logs into their Supabase account;
2. opens the invite;
3. joins the challenge;
4. completes profile setup.

Once the challenge has two members:

- the challenge is full;
- no additional member can join.

---

# 6. Profile Setup

Each participant must provide:

- display name;
- profile picture;
- personal diet commitment.

Example diet commitment:

> Stay within calorie target, no alcohol, no takeaways.

Profile picture is central to the head-to-head race UI.

---

# 7. Daily Requirements

There are four scored categories.

---

## 7.1 Diet

The user checks whether they followed their own predefined diet commitment.

### Fields

- `diet_complete: boolean`
- `diet_note: text | null`

### Example

```text
DIET ✓
Stayed within calorie target. Chicken, rice and vegetables.
```

The note is optional and does not affect scoring.

---

## 7.2 Workout

The workout category has three internal checks:

- Workout 1 — minimum 45 minutes
- Workout 2 — minimum 45 minutes
- At least one workout outdoors

The overall workout category counts as complete only if all three conditions are true.

### Fields

- `workout_1_complete: boolean`
- `workout_2_complete: boolean`
- `outdoor_complete: boolean`
- `workout_note: text | null`

### Example

```text
WORKOUT ✓

✓ Workout 1 — 45 min
✓ Workout 2 — 45 min
✓ At least one outdoors

Biceps in the gym + 50-minute outside walk.
```

The app does not need to validate workout type. The challenge operates on an honour system.

---

## 7.3 Water

Daily target:

**3.8 litres**

### Fields

- `water_complete: boolean`
- `water_note: text | null`

### Example

```text
WATER ✓
4.1 L today.
```

---

## 7.4 Bible Reading

Daily target:

**at least 10 pages of Bible reading**

### Fields

- `bible_complete: boolean`
- `bible_reference: text | null`
- `bible_note: text | null`

### Example

```text
BIBLE READING ✓
Matthew 5–8
```

or:

```text
BIBLE READING ✓
Romans 5–8

Really liked Romans 8 today.
```

The MVP must use free text for references.

Do not build a Bible-reference parser.

---

# 8. Notes on Every Requirement

Every scored requirement supports an optional contextual note.

Notes are visible to the other participant.

Notes do not affect completion status.

Examples:

- Diet: `Stayed within calorie target.`
- Workout: `Biceps in the gym + outside walk.`
- Water: `3.9 L total.`
- Bible: `Matthew 5–8.`

The purpose is accountability and context, not verification.

---

# 9. Daily Status Logic

## 9.1 Pending

During the active day:

- incomplete tasks remain neutral;
- no task should become red merely because it is not yet complete.

Example:

```text
Diet         ✓
Workout      ○
Water        ✓
Bible        ○
```

## 9.2 Perfect Day

A day is perfect when:

```text
diet_complete = true
AND workout_1_complete = true
AND workout_2_complete = true
AND outdoor_complete = true
AND water_complete = true
AND bible_complete = true
```

A perfect day contributes:

- +1 perfect day;
- +1 day to current streak if previous day was also perfect;
- movement in the head-to-head race.

## 9.3 Failed Day

When a day closes with any required item incomplete:

```text
status = failed
```

The system then generates exactly:

```text
🥄 +1
```

Only one wooden spoon can be generated per user per day.

Even if several requirements were missed, the user receives one spoon.

---

# 10. Day Closing

Challenge timezone:

`Africa/Johannesburg`

A day closes at:

`23:59:59 SAST`

There is no grace period.

After midnight:

- completed requirements remain green;
- incomplete requirements become red;
- the day is finalized;
- the day becomes read-only for normal users;
- a failed day generates one wooden spoon.

Historical days must not be normally editable.

---

# 11. Wooden Spoon System

The wooden spoon system is the core consequence mechanic.

## 11.1 Earning a spoon

A participant gets exactly one wooden spoon for every failed day.

## 11.2 Spoon balance

Display the current outstanding balance prominently.

Example:

```text
MARKUS

42 PERFECT DAYS
🔥 11 DAY STREAK
🥄 4
```

## 11.3 Spoon ledger

Every spoon must have a ledger entry.

Example:

```text
🥄 18 Sep
Missed:
- Bible reading

🥄 12 Sep
Missed:
- Water
- Workout
```

Automatically generated spoon records cannot be manually deleted by users.

---

# 12. Failure Reason / Spoon Reason

When a participant receives a wooden spoon, they can optionally explain why the day failed.

Example:

```text
WOODEN SPOON 🥄
21 September

Missed:
✕ Workout
✕ Bible reading

Reason:
Mother's birthday — spent the evening with family.
```

The other participant can see the reason.

The reason:

- is optional;
- can be added before or after finalisation;
- can be edited by the participant who owns the day;
- does not remove the spoon;
- does not convert a failed day into a perfect day.

**Explanation is not exemption.**

Recommended field:

```text
failure_reason: text | null
```

Store this on the daily check-in, not on the spoon ledger entry.

---

# 13. Likes

Each participant may like the other participant's daily progress card.

Rules:

- one like per user per daily card;
- cannot like own daily card;
- like can be removed;
- likes do not affect scoring;
- likes should update in realtime.

Purpose:

**acknowledgement and accountability only.**

---

# 14. Comments

Each participant may comment on the other person's daily card.

Requirements:

- comment body;
- author name;
- author avatar;
- timestamp;
- realtime updates;
- author can edit own comment;
- author can delete own comment.

Comments do not affect scoring.

Do not build a separate comment system specifically for wooden spoons in the MVP. The day-level comment thread already provides the conversation layer.

---

# 15. Optional Daily Note

Each participant may optionally add a general note to their own day.

Example:

> Legs were cooked after work but still got both sessions done.

Suggested MVP maximum:

`500 characters`

This field is separate from per-requirement notes.

---

# 16. Progress Photos

Progress photos are:

- optional;
- private;
- not part of daily scoring;
- not part of perfect-day logic;
- not capable of generating a spoon;
- intended approximately once per calendar month.

Store them in a private Supabase Storage bucket.

Only the two challenge participants may view them.

Use signed URLs when rendering them.

Recommended MVP limit:

- one official photo per participant per calendar month.

Example:

```text
SEPTEMBER PROGRESS

Photo uploaded ✓
21 September 2026
```

---

# 17. Head-to-Head Race

This is one of the most important visual features.

The UI should resemble a clean two-lane race, using each participant's profile picture as the racer.

The design may take conceptual inspiration from horse-race position tracking, but must not look cartoonish.

Example:

```text
HEAD TO HEAD                              DEC 31 🏁

MARKUS
━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━
                [PFP]

42 PERFECT DAYS
🔥 11                              🥄 3


PARTNER
━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━
                   [PFP]

48 PERFECT DAYS
🔥 16                              🥄 1
```

---

# 18. Race Metric

Race position is based only on:

**Perfect Days**

Do not use:

- total checked subtasks;
- likes;
- comments;
- completion percentage;
- streak length;
- spoon count.

Conceptual position:

```text
race_progress = perfect_days / possible_challenge_days_elapsed
```

For the visual lane, the exact rendering can be normalized based on total challenge duration.

The critical rule is that more perfect days = further race position.

---

# 19. Race Animation

When a new perfect day is confirmed:

- increment perfect-day count;
- move the participant PFP slightly forward;
- use subtle motion only;
- target roughly `200–400ms`;
- no glow;
- no neon;
- no confetti by default;
- no excessive bounce.

The interaction should feel like a sports-performance product, not a mobile game.

---

# 20. Statistics

Each participant should have the following primary stats.

## Perfect Days

Number of fully successful days.

## Overall Completion Percentage

Percentage of scored daily requirements completed.

Recommended formula:

```text
completed_scored_categories / possible_scored_categories
```

Use four top-level categories per day:

- Diet
- Workout
- Water
- Bible

Workout only counts as complete when all three workout subconditions are true.

## Current Streak

Consecutive perfect days ending on the latest eligible day.

## Longest Streak

Maximum consecutive perfect-day run.

## Spoon Balance

Outstanding wooden spoon count.

---

# 21. Dashboard

The dashboard is the default logged-in route.

Recommended information hierarchy:

1. challenge title and countdown;
2. head-to-head PFP race;
3. today's progress cards;
4. key stats;
5. recent activity if included.

Example:

```text
THE CHALLENGE
Ends 31 December
101 days remaining

HEAD TO HEAD
[Race lanes]

TODAY

MARKUS
Diet             ✓
Workout          ○
Water            ✓
Bible            ○

2 / 4 COMPLETE

PARTNER
Diet             ✓
Workout          ✓
Water            ✓
Bible            ✓

PERFECT

♥ Like    💬 2
```

---

# 22. Daily Card UX

Each daily card should show:

- participant PFP;
- participant name;
- daily status;
- diet;
- workout details;
- water;
- Bible reading;
- optional notes;
- like control;
- comments.

For mobile cleanliness, notes should be collapsible or only expand when present/edited.

Example:

```text
✓ DIET
  + Add note
```

After expansion:

```text
✓ DIET

[ Stayed on calorie target today. ]
```

---

# 23. Calendar

The calendar is the historical view.

Each day should show both participants' states.

Possible status presentation:

- green = perfect;
- red = failed;
- neutral = pending/future.

Do not rely on colour alone. Include accessible symbols/tooltips/labels where necessary.

Clicking a day opens that day's detailed view.

---

# 24. Historical Day Detail

Example:

```text
18 SEPTEMBER

MARKUS

DIET                                  ✓
Stayed on plan.

WORKOUT                               ✕
✓ Workout 1
✕ Workout 2
✓ Outdoor

Morning gym session but could not get
the second workout in.

WATER                                 ✓

BIBLE READING                         ✕

────────────────────────────────

FAILED
🥄 WOODEN SPOON

Reason:
Mother's birthday. Family dinner and
got home very late.

♥ 1      💬 2
```

The calendar should function as a challenge journal, not merely a red/green record.

---

# 25. Wooden Spoon Repayment

After the challenge ends, outstanding spoons become repayable.

The other participant decides what repayment should be.

Example:

```text
YOU OWE 6 SPOONS
```

Partner can create:

```text
Make breakfast
Cost: 🥄 2
```

Suggested lifecycle:

```text
requested
→ accepted
→ completed
→ confirmed
```

Only after the receiving participant confirms completion should those spoons count as redeemed.

---

# 26. Navigation

Keep navigation minimal.

## Desktop

- Dashboard
- Calendar
- Photos
- Spoons
- Profile

## Mobile

Use bottom navigation:

- Home
- Calendar
- Photos
- Spoons
- Profile

Do not use a large enterprise sidebar.

---

# 27. End-of-Challenge Summary

After 31 December, show both participants side by side.

Recommended statistics:

| Statistic | User A | User B |
|---|---:|---:|
| Perfect days | value | value |
| Completion % | value | value |
| Longest streak | value | value |
| Diet days | value | value |
| Workout days | value | value |
| Water days | value | value |
| Bible days | value | value |
| Spoons earned | value | value |
| Spoons outstanding | value | value |

Then make spoon repayment prominent:

```text
TIME TO PAY THE SPOONS
```

---

# 28. UX and Visual Direction

The interface must feel like:

**premium gym × performance journal × training locker room**

It must not feel like:

- crypto;
- gaming;
- AI SaaS;
- futuristic neon dashboard;
- generic habit tracker.

Visual inspiration:

- black rubber gym flooring;
- brushed steel;
- premium strength equipment;
- performance scoreboards;
- athletic training journals;
- understated sportswear branding.

---

# 29. Impeccable Requirement

Impeccable must be treated as a formal UI/UX implementation requirement.

Repository should include:

```text
PRODUCT.md
DESIGN.md
```

The design instructions must explicitly include:

```text
No gradients.
No neon colours.
No glow effects.
No glassmorphism.
Avoid excessive rounded containers.
Avoid generic AI/SaaS dashboard styling.
Use colour semantically.
Use strong typography and spacing hierarchy.
Use a premium gym/performance aesthetic.
Keep interactions restrained and functional.
```

Major pages should receive UI review/refinement passes before release, including:

- layout;
- typography;
- simplification;
- consistency;
- polish;
- accessibility;
- responsive behaviour.

---

# 30. Colour System

No gradients.

No neon.

No glowing controls.

No electric blue/purple AI aesthetic.

Suggested palette:

```text
Graphite        #181A1B
Iron            #25282A
Warm Off-White  #F2F0EB
Steel Grey      #8B8F91
Success Green   #59745B
Failure Red     #8B4943
Spoon Brass     #A47C48
```

Use success/failure/brass colours sparingly and semantically.

---

# 31. Typography

Recommended direction:

## Headings / statistics

Use a strong condensed or athletic grotesk, for example:

- Barlow Condensed;
- Archivo Narrow;
- similar.

## Body

Use:

- Inter;
- Geist;
- another readable neutral sans-serif.

Numbers should be visually prominent.

Example:

```text
48
PERFECT DAYS
```

---

# 32. Component Styling

Prefer:

- 6–10px border radius;
- crisp borders;
- flat surfaces;
- strong separators;
- substantial buttons;
- strong hierarchy.

Avoid:

- 24px rounded cards everywhere;
- floating translucent surfaces;
- giant pills;
- excessive chips;
- decorative gradients.

---

# 33. Responsive Behaviour

The app must be mobile-first.

Target widths:

```text
375px
390px
430px
768px
1024px
1440px
```

Daily tracking must be easy to update on a phone.

Race lanes must work without horizontal scrolling.

---

# 34. Technical Architecture

## Frontend

Required:

- Next.js
- TypeScript
- App Router
- Tailwind CSS

Optional:

- shadcn/ui primitives

If shadcn is used, components must be restyled to match the product aesthetic rather than retaining generic shadcn appearance.

## Backend

Use Supabase for:

- Authentication
- PostgreSQL
- Storage
- Realtime
- Row Level Security
- database functions
- scheduled finalisation jobs

## Deployment

```text
Frontend  → Vercel
Database  → Supabase PostgreSQL
Auth      → Supabase Auth
Images    → Supabase Storage
Realtime  → Supabase Realtime
```

No standalone Express API is required for MVP.

Use:

- Next.js Server Actions;
- Route Handlers;
- Supabase RPC;
- PostgreSQL functions where appropriate.

---

# 35. Database Schema

## 35.1 `profiles`

```sql
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null,
    avatar_path text,
    diet_commitment text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
```

---

## 35.2 `challenges`

```sql
create table challenges (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    start_date date not null,
    end_date date not null default '2026-12-31',
    timezone text not null default 'Africa/Johannesburg',
    created_by uuid not null references auth.users(id),
    invite_code text not null unique,
    status text not null default 'pending',
    created_at timestamptz not null default now()
);
```

Suggested statuses:

```text
pending
active
complete
```

---

## 35.3 `challenge_members`

```sql
create table challenge_members (
    id uuid primary key default gen_random_uuid(),
    challenge_id uuid not null references challenges(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    joined_at timestamptz not null default now(),

    unique (challenge_id, user_id)
);
```

Enforce a maximum of two members per challenge.

---

## 35.4 `daily_checkins`

```sql
create table daily_checkins (
    id uuid primary key default gen_random_uuid(),

    challenge_id uuid not null references challenges(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    challenge_date date not null,

    diet_complete boolean not null default false,
    diet_note text,

    workout_1_complete boolean not null default false,
    workout_2_complete boolean not null default false,
    outdoor_complete boolean not null default false,
    workout_note text,

    water_complete boolean not null default false,
    water_note text,

    bible_complete boolean not null default false,
    bible_reference text,
    bible_note text,

    day_note text,
    failure_reason text,

    status text not null default 'pending',
    finalized_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (challenge_id, user_id, challenge_date)
);
```

Statuses:

```text
pending
perfect
failed
```

---

## 35.5 `progress_photos`

```sql
create table progress_photos (
    id uuid primary key default gen_random_uuid(),
    challenge_id uuid not null references challenges(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    month date not null,
    storage_path text not null,
    caption text,
    created_at timestamptz not null default now(),

    unique (challenge_id, user_id, month)
);
```

---

## 35.6 `daily_likes`

```sql
create table daily_likes (
    id uuid primary key default gen_random_uuid(),
    daily_checkin_id uuid not null references daily_checkins(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),

    unique (daily_checkin_id, user_id)
);
```

---

## 35.7 `daily_comments`

```sql
create table daily_comments (
    id uuid primary key default gen_random_uuid(),
    daily_checkin_id uuid not null references daily_checkins(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    body text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
```

---

## 35.8 `spoon_entries`

```sql
create table spoon_entries (
    id uuid primary key default gen_random_uuid(),
    challenge_id uuid not null references challenges(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    daily_checkin_id uuid references daily_checkins(id) on delete cascade,

    type text not null,
    quantity integer not null,
    created_at timestamptz not null default now()
);
```

Types:

```text
earned
redeemed
adjustment
```

For automatic failed-day spoons:

```text
type = earned
quantity = 1
```

Protect against duplicate automatic spoon creation.

Recommended uniqueness strategy for earned failure spoons:

```sql
create unique index one_earned_spoon_per_failed_day
on spoon_entries(daily_checkin_id)
where type = 'earned';
```

---

## 35.9 `spoon_repayments`

```sql
create table spoon_repayments (
    id uuid primary key default gen_random_uuid(),

    challenge_id uuid not null references challenges(id) on delete cascade,

    debtor_user_id uuid not null references auth.users(id),
    requested_by_user_id uuid not null references auth.users(id),

    title text not null,
    description text,
    spoon_cost integer not null check (spoon_cost > 0),

    status text not null default 'requested',

    created_at timestamptz not null default now(),
    accepted_at timestamptz,
    completed_at timestamptz,
    confirmed_at timestamptz
);
```

Statuses:

```text
requested
accepted
completed
confirmed
cancelled
```

---

# 36. Derived Metrics

Do not store mutable counters unless required for performance.

Prefer deriving:

- perfect days;
- completion percentage;
- spoon balance;
- current streak;
- longest streak.

## Spoon balance

```text
spoon_balance =
sum(earned)
- sum(redeemed)
+ sum(adjustments)
```

## Workout completion

```text
workout_complete =
workout_1_complete
AND workout_2_complete
AND outdoor_complete
```

## Day perfection

```text
perfect =
diet_complete
AND workout_complete
AND water_complete
AND bible_complete
```

---

# 37. Daily Finalisation

Implement an idempotent database function such as:

```text
finalize_challenge_day(target_date date)
```

For each challenge member:

1. retrieve or create the daily record;
2. calculate workout completion;
3. evaluate all four scored categories;
4. set `status = perfect` or `status = failed`;
5. if failed, insert exactly one `earned` spoon entry;
6. set `finalized_at`;
7. leave existing finalised records unchanged.

The function must be safe to run repeatedly without duplicating spoons.

---

# 38. Scheduled Finalisation

Run shortly after midnight in `Africa/Johannesburg`.

Recommended schedule:

`00:05 SAST`

Use Supabase Cron or another protected scheduled backend job.

Also perform an idempotent stale-day check when the app loads so that scheduler failure cannot permanently leave old days pending.

---

# 39. Realtime

Subscribe to relevant Supabase Realtime events for:

- `daily_checkins`
- `daily_likes`
- `daily_comments`
- `spoon_entries`
- `spoon_repayments`

Examples:

- partner checks Bible → other dashboard updates;
- partner comments → comment appears without refresh;
- partner likes card → like count updates.

---

# 40. Row Level Security

RLS is mandatory.

## Profiles

- user can update own profile;
- challenge partner may view the profile of the other challenge member.

## Daily check-ins

A user may:

- read both participants' daily check-ins for their challenge;
- update only their own current non-finalized check-in.

A user may not:

- edit partner check-ins;
- edit finalized historical completion fields.

Allow the owner to update `failure_reason` on their own failed day after finalisation if desired.

## Likes

Challenge member can:

- read challenge likes;
- like partner's daily card;
- remove own like.

Cannot like own daily card.

## Comments

Challenge member can read comments for challenge days.

Author can:

- insert own comment;
- edit own comment;
- delete own comment.

## Progress photos

Only members of the same challenge can:

- read metadata;
- obtain signed URLs;
- upload their own photo.

## Spoon records

Both challenge members may read.

Automatically earned spoon rows cannot be modified/deleted by normal users.

---

# 41. Supabase Storage

Suggested structure:

```text
avatars/
  {userId}/avatar.webp

progress/
  {challengeId}/
    {userId}/
      2026-09.webp
      2026-10.webp
      2026-11.webp
      2026-12.webp
```

Progress bucket must be private.

Use:

- MIME validation;
- file-size validation;
- client-side compression where appropriate;
- signed URLs for display.

Suggested maximum source image size:

`10 MB`

---

# 42. Route Structure

```text
/
├── login
├── register
├── forgot-password
│
├── onboarding
│   ├── challenge
│   └── profile
│
└── app
    ├── dashboard
    ├── calendar
    ├── calendar/[date]
    ├── photos
    ├── spoons
    └── profile
```

---

# 43. Suggested Component Structure

## Dashboard

```text
DashboardPage
├── ChallengeHeader
│   ├── ChallengeTitle
│   └── Countdown
├── HeadToHeadRace
│   ├── RacerLane
│   └── RacerLane
├── TodaySection
│   ├── OwnDailyCard
│   └── PartnerDailyCard
├── StatsSummary
└── RecentActivity (optional)
```

## Daily Progress Card

```text
DailyProgressCard
├── ProfileHeader
├── DayStatus
├── DietSection
├── WorkoutSection
│   ├── Workout1Checkbox
│   ├── Workout2Checkbox
│   └── OutdoorCheckbox
├── WaterSection
├── BibleSection
├── DayNote
├── CompletionSummary
├── LikeButton
└── CommentThread
```

---

# 44. Accessibility

Minimum target:

**WCAG AA**

Requirements:

- keyboard navigation;
- visible focus states;
- semantic buttons;
- associated labels;
- appropriate contrast;
- readable form feedback;
- do not communicate status using colour alone.

Use:

```text
✓ Perfect
✕ Failed
○ Pending
```

with colour as reinforcement.

---

# 45. Error Handling

Required user-facing states:

- network unavailable;
- Supabase unavailable;
- stale/expired session;
- failed image upload;
- failed comment;
- realtime disconnected;
- expired invite;
- challenge full;
- failed checkbox persistence.

Optimistic checkbox updates are acceptable, but must roll back on persistence failure.

---

# 46. Performance

Targets:

- primary interactions should feel immediate;
- dashboard meaningful content should load quickly on normal mobile connections;
- images must be optimized;
- monthly progress photos should lazy-load;
- dashboard should not fetch the entire historical challenge;
- calendar should fetch only relevant month/range data.

---

# 47. Privacy

This is a private two-person product.

Requirements:

- no public profiles;
- no public leaderboard;
- no public comments;
- no permanent public URLs for progress photos;
- private storage;
- RLS;
- signed photo access.

---

# 48. MVP Scope

The MVP must include the complete core accountability loop.

## 48.1 Authentication

- register;
- login;
- logout;
- password reset.

## 48.2 Challenge

- create challenge;
- join by invite;
- maximum two users;
- end date 31 December 2026.

## 48.3 Profile

- display name;
- profile picture;
- personal diet commitment.

## 48.4 Daily Tracking

- diet checkbox + optional note;
- workout 1 checkbox;
- workout 2 checkbox;
- outdoor checkbox;
- optional workout description;
- water checkbox + optional note;
- Bible checkbox;
- optional Bible reference;
- optional Bible note;
- optional daily note.

## 48.5 Day Status

- pending;
- perfect;
- failed;
- midnight finalisation;
- no grace period;
- historical lock.

## 48.6 Wooden Spoons

- one spoon per failed day;
- visible spoon balance;
- spoon history;
- visible missed requirements;
- optional failure reason;
- partner can see the reason.

## 48.7 Dashboard

- challenge countdown;
- PFP head-to-head race;
- perfect-day counts;
- current streak;
- completion percentage;
- spoon balance;
- both daily cards.

## 48.8 Social Accountability

- like partner's daily card;
- comment on partner's daily card;
- realtime updates.

## 48.9 Calendar

- monthly view;
- both participant statuses;
- historical day detail.

## 48.10 Progress Photos

- optional monthly upload;
- private storage;
- visible to both participants.

## 48.11 End-of-Challenge

- final summary;
- spoon totals;
- basic spoon repayment flow.

## 48.12 UI/UX

- responsive;
- gym/performance aesthetic;
- Impeccable design workflow;
- no gradients;
- no neon;
- no glows;
- no glassmorphism.

---

# 49. MVP Acceptance Criteria

The MVP is complete only when all of the following pass:

1. Two users can authenticate and join the same private challenge.
2. A third user cannot join.
3. Each participant can set display name, PFP and diet commitment.
4. Each participant can update today's own checklist.
5. A participant cannot modify the partner's checklist.
6. Diet supports an optional note.
7. Workout supports both 45-minute checks, outdoor check and optional description.
8. Water supports an optional note.
9. Bible supports completion, optional reference and optional note.
10. Daily general note is supported.
11. A day becomes perfect only when all scored requirements are complete.
12. An incomplete closed day becomes failed.
13. Failed day creates exactly one wooden spoon.
14. Re-running finalisation cannot duplicate the spoon.
15. Finalized completion fields cannot be changed normally.
16. A failed day supports an optional `failure_reason`.
17. The partner can see that failure reason.
18. Adding a failure reason does not remove the spoon.
19. Historical days display task results and notes.
20. Calendar clearly distinguishes perfect, failed and pending states.
21. Head-to-head race is based on perfect-day count.
22. Race uses each participant's profile picture.
23. Likes work only on the partner's card.
24. Comments work on the partner's card.
25. Likes/comments update in realtime.
26. Monthly progress photos are stored privately.
27. One challenge participant cannot access media from another unrelated challenge.
28. Spoon balance is ledger-derived.
29. Spoon history displays failed date and missed requirements.
30. Spoon repayment flow works after challenge completion.
31. App is fully usable on iPhone-sized screens.
32. No gradients are used.
33. No neon colours are used.
34. No glow effects are used.
35. No glassmorphism is used.
36. The UI reads as premium gym/performance rather than generic SaaS.
37. Challenge transitions correctly after 31 December.

---

# 50. Non-Goals for MVP

Do not build:

- public challenges;
- groups larger than two;
- Garmin integration;
- Strava integration;
- Apple Health;
- Google Fit;
- calorie tracking;
- meal logging;
- detailed workout logging;
- workout validation;
- messaging/chat;
- public social feed;
- public profiles;
- AI coaching;
- complex badges;
- configurable arbitrary habit systems;
- payment processing;
- Bible API integration;
- Bible-reference parsing.

---

# 51. Post-MVP / Phase 1.1

Candidates:

- enhanced activity feed;
- milestone messages;
- richer race animation;
- longest-streak visualization;
- photo captions;
- stronger final-year summary;
- PWA installation;
- reminders.

---

# 52. Phase 2

Potential future features:

- Web Push;
- custom reminder times;
- Garmin/Strava integrations;
- configurable challenge rules;
- recurring challenges;
- historical challenge archive;
- data export;
- before/after progress-photo comparison;
- configurable spoon mechanics.

---

# 53. Suggested Build Order for an AI Coding Agent

Implement in this order:

## Phase A — Foundation

1. Bootstrap Next.js + TypeScript + Tailwind.
2. Configure Supabase project/client.
3. Implement Auth.
4. Implement schema migrations.
5. Implement RLS.
6. Create base design tokens and `DESIGN.md`.

## Phase B — Challenge and Profiles

1. Profile onboarding.
2. Challenge creation.
3. Invite/join.
4. Two-member limit.
5. PFP upload.

## Phase C — Daily Tracking

1. Daily check-in creation.
2. Four scored categories.
3. Workout subconditions.
4. Optional notes.
5. Bible references.
6. Failure reason field.
7. Own-vs-partner permissions.

## Phase D — Finalisation

1. Perfect-day calculation.
2. Failed-day calculation.
3. Idempotent finalisation function.
4. Spoon generation.
5. Scheduled finalisation.
6. Historical lock.

## Phase E — Dashboard

1. Countdown.
2. Stats.
3. Head-to-head PFP race.
4. Own daily card.
5. Partner daily card.

## Phase F — Social Layer

1. Likes.
2. Comments.
3. Realtime subscriptions.

## Phase G — Calendar

1. Month view.
2. Dual-user status indicators.
3. Day detail.
4. Notes and failure reasons.

## Phase H — Photos

1. Private Storage bucket.
2. Monthly uploads.
3. Signed display URLs.

## Phase I — Spoon System

1. Spoon history.
2. Outstanding balance.
3. Repayment requests.
4. Completion/confirmation.

## Phase J — Final Summary

1. End-of-challenge detection.
2. Final statistics.
3. Spoon repayment CTA.

## Phase K — Polish

1. Impeccable audit.
2. Responsive refinement.
3. Accessibility.
4. Error states.
5. Loading states.
6. Performance pass.

---

# 54. AI Agent Implementation Rules

The AI coding agent should follow these rules:

1. Do not invent extra product features unless explicitly required.
2. Treat this document as the source of truth.
3. Keep business logic server/database-enforced where practical.
4. RLS is mandatory, not optional.
5. Do not trust client-side checks for challenge membership or permissions.
6. Finalisation must be idempotent.
7. Never generate more than one earned spoon per failed user/day.
8. Historical scored fields must become immutable after finalisation.
9. Failure reason may remain editable by the owner after finalisation.
10. Notes never affect scoring.
11. The workout category only counts when both workouts and the outdoor condition are complete.
12. Race position is based only on perfect days.
13. Likes and comments never affect scoring.
14. Progress photos never affect scoring.
15. Use private Storage for progress photos.
16. Use semantic colour and accessible status labels.
17. Do not use gradients, neon, glow, glassmorphism or generic AI-dashboard styling.
18. Keep UI visually restrained and gym/performance oriented.
19. Prioritize mobile usability.
20. Prefer simple, maintainable implementation over abstraction-heavy architecture.

---

# 55. Definition of Done

The product is ready for MVP release when:

- both participants can complete an entire challenge day end-to-end;
- the second participant can see progress and accountability context;
- perfect/failed status finalizes correctly;
- spoon issuance is reliable and duplicate-safe;
- historical data cannot be improperly manipulated;
- comments and likes work;
- monthly progress photos remain private;
- the head-to-head race reflects perfect days correctly;
- mobile UX is polished;
- all core RLS policies are tested;
- the UI meets the gym/performance design constraints;
- the app is deployed successfully to Vercel and connected to production Supabase.

