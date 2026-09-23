-- Proposed MVP schema for 100 Hard.
-- Not applied. Wait for explicit owner approval before running this on the remote project.

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_path text,
  diet_commitment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null default '2026-12-31',
  timezone text not null default 'Africa/Johannesburg',
  created_by uuid not null references auth.users(id),
  invite_code text not null unique,
  status text not null default 'pending' check (status in ('pending', 'active', 'complete')),
  created_at timestamptz not null default now()
);

create table if not exists public.challenge_members (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (challenge_id, user_id)
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
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
  status text not null default 'pending' check (status in ('pending', 'perfect', 'failed')),
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (challenge_id, user_id, challenge_date)
);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now(),
  unique (challenge_id, user_id, month)
);

create table if not exists public.daily_likes (
  id uuid primary key default gen_random_uuid(),
  daily_checkin_id uuid not null references public.daily_checkins(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (daily_checkin_id, user_id)
);

create table if not exists public.daily_comments (
  id uuid primary key default gen_random_uuid(),
  daily_checkin_id uuid not null references public.daily_checkins(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spoon_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_checkin_id uuid references public.daily_checkins(id) on delete cascade,
  type text not null check (type in ('earned', 'redeemed', 'adjustment')),
  quantity integer not null,
  created_at timestamptz not null default now()
);

create unique index if not exists one_earned_spoon_per_failed_day
  on public.spoon_entries(daily_checkin_id)
  where type = 'earned';

create table if not exists public.spoon_repayments (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  debtor_user_id uuid not null references auth.users(id),
  requested_by_user_id uuid not null references auth.users(id),
  title text not null,
  description text,
  spoon_cost integer not null check (spoon_cost > 0),
  status text not null default 'requested' check (status in ('requested', 'accepted', 'completed', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  confirmed_at timestamptz
);

create or replace function private.is_challenge_member(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.challenge_members
    where challenge_id = target
      and user_id = auth.uid()
  );
$$;

create or replace function private.shares_challenge(other uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.challenge_members mine
    join public.challenge_members theirs
      on theirs.challenge_id = mine.challenge_id
    where mine.user_id = auth.uid()
      and theirs.user_id = other
  );
$$;

create or replace function private.enforce_two_members()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.challenge_members where challenge_id = new.challenge_id) >= 2 then
    raise exception 'challenge_full';
  end if;
  return new;
end;
$$;

drop trigger if exists challenge_members_cap on public.challenge_members;
create trigger challenge_members_cap
  before insert on public.challenge_members
  for each row execute function private.enforce_two_members();

create or replace function private.prevent_self_like()
returns trigger
language plpgsql
as $$
declare
  owner uuid;
begin
  select user_id into owner from public.daily_checkins where id = new.daily_checkin_id;
  if owner = new.user_id then
    raise exception 'cannot_like_own_card';
  end if;
  return new;
end;
$$;

drop trigger if exists daily_likes_no_self on public.daily_likes;
create trigger daily_likes_no_self
  before insert on public.daily_likes
  for each row execute function private.prevent_self_like();

create or replace function private.lock_finalized_scores()
returns trigger
language plpgsql
as $$
begin
  if old.finalized_at is not null then
    if new.diet_complete is distinct from old.diet_complete
      or new.workout_1_complete is distinct from old.workout_1_complete
      or new.workout_2_complete is distinct from old.workout_2_complete
      or new.outdoor_complete is distinct from old.outdoor_complete
      or new.water_complete is distinct from old.water_complete
      or new.bible_complete is distinct from old.bible_complete
      or new.status is distinct from old.status
      or new.finalized_at is distinct from old.finalized_at then
      raise exception 'day_locked';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists daily_checkins_lock on public.daily_checkins;
create trigger daily_checkins_lock
  before update on public.daily_checkins
  for each row execute function private.lock_finalized_scores();

create or replace function private.finalize_challenge_day(target_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  member record;
  checkin public.daily_checkins%rowtype;
  workout_ok boolean;
  perfect boolean;
begin
  for member in
    select cm.challenge_id, cm.user_id
    from public.challenge_members cm
    join public.challenges c on c.id = cm.challenge_id
    where target_date >= c.start_date
      and target_date <= c.end_date
      and target_date < ((timezone(c.timezone, now()))::date)
  loop
    select * into checkin
    from public.daily_checkins
    where challenge_id = member.challenge_id
      and user_id = member.user_id
      and challenge_date = target_date;

    if not found then
      insert into public.daily_checkins (challenge_id, user_id, challenge_date)
      values (member.challenge_id, member.user_id, target_date)
      returning * into checkin;
    end if;

    if checkin.finalized_at is not null then
      if checkin.status = 'failed' then
        insert into public.spoon_entries (challenge_id, user_id, daily_checkin_id, type, quantity)
        values (member.challenge_id, member.user_id, checkin.id, 'earned', 1)
        on conflict (daily_checkin_id) where type = 'earned' do nothing;
      end if;
      continue;
    end if;

    workout_ok := checkin.workout_1_complete and checkin.workout_2_complete and checkin.outdoor_complete;
    perfect := checkin.diet_complete and workout_ok and checkin.water_complete and checkin.bible_complete;

    update public.daily_checkins
    set
      status = case when perfect then 'perfect' else 'failed' end,
      finalized_at = now(),
      updated_at = now()
    where id = checkin.id;

    if not perfect then
      insert into public.spoon_entries (challenge_id, user_id, daily_checkin_id, type, quantity)
      values (member.challenge_id, member.user_id, checkin.id, 'earned', 1)
      on conflict (daily_checkin_id) where type = 'earned' do nothing;
    end if;
  end loop;
end;
$$;

create or replace function public.finalize_challenge_day(target_date date)
returns void
language sql
security definer
set search_path = public
as $$
  select private.finalize_challenge_day(target_date);
$$;

revoke all on function private.finalize_challenge_day(date) from public;
revoke all on function private.is_challenge_member(uuid) from public;
revoke all on function private.shares_challenge(uuid) from public;
grant execute on function public.finalize_challenge_day(date) to authenticated;

alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_members enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.progress_photos enable row level security;
alter table public.daily_likes enable row level security;
alter table public.daily_comments enable row level security;
alter table public.spoon_entries enable row level security;
alter table public.spoon_repayments enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or private.shares_challenge(id));
create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (id = auth.uid());
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy challenges_select on public.challenges
  for select to authenticated
  using (private.is_challenge_member(id) or created_by = auth.uid());
create policy challenges_insert on public.challenges
  for insert to authenticated
  with check (created_by = auth.uid());
create policy challenges_update on public.challenges
  for update to authenticated
  using (private.is_challenge_member(id));

create policy members_select on public.challenge_members
  for select to authenticated
  using (private.is_challenge_member(challenge_id) or user_id = auth.uid());
create policy members_insert on public.challenge_members
  for insert to authenticated
  with check (user_id = auth.uid());

create policy checkins_select on public.daily_checkins
  for select to authenticated
  using (private.is_challenge_member(challenge_id));
create policy checkins_insert on public.daily_checkins
  for insert to authenticated
  with check (user_id = auth.uid() and private.is_challenge_member(challenge_id));
create policy checkins_update on public.daily_checkins
  for update to authenticated
  using (user_id = auth.uid() and private.is_challenge_member(challenge_id))
  with check (user_id = auth.uid());

create policy likes_select on public.daily_likes
  for select to authenticated
  using (exists (
    select 1 from public.daily_checkins d
    where d.id = daily_checkin_id and private.is_challenge_member(d.challenge_id)
  ));
create policy likes_insert on public.daily_likes
  for insert to authenticated
  with check (user_id = auth.uid());
create policy likes_delete on public.daily_likes
  for delete to authenticated
  using (user_id = auth.uid());

create policy comments_select on public.daily_comments
  for select to authenticated
  using (exists (
    select 1 from public.daily_checkins d
    where d.id = daily_checkin_id and private.is_challenge_member(d.challenge_id)
  ));
create policy comments_insert on public.daily_comments
  for insert to authenticated
  with check (user_id = auth.uid());
create policy comments_update on public.daily_comments
  for update to authenticated
  using (user_id = auth.uid());
create policy comments_delete on public.daily_comments
  for delete to authenticated
  using (user_id = auth.uid());

create policy photos_select on public.progress_photos
  for select to authenticated
  using (private.is_challenge_member(challenge_id));
create policy photos_insert on public.progress_photos
  for insert to authenticated
  with check (user_id = auth.uid() and private.is_challenge_member(challenge_id));

create policy spoons_select on public.spoon_entries
  for select to authenticated
  using (private.is_challenge_member(challenge_id));

create policy repayments_select on public.spoon_repayments
  for select to authenticated
  using (private.is_challenge_member(challenge_id));
create policy repayments_insert on public.spoon_repayments
  for insert to authenticated
  with check (
    requested_by_user_id = auth.uid()
    and private.is_challenge_member(challenge_id)
  );
create policy repayments_update on public.spoon_repayments
  for update to authenticated
  using (private.is_challenge_member(challenge_id));

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false), ('progress', 'progress', false)
on conflict (id) do nothing;

create policy avatars_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or private.shares_challenge(((storage.foldername(name))[1])::uuid)
    )
  );

create policy avatars_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_update on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy progress_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'progress'
    and private.is_challenge_member((storage.foldername(name))[1]::uuid)
  );

create policy progress_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'progress'
    and private.is_challenge_member((storage.foldername(name))[1]::uuid)
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy progress_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'progress'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

alter publication supabase_realtime add table public.daily_checkins;
alter publication supabase_realtime add table public.daily_likes;
alter publication supabase_realtime add table public.daily_comments;
alter publication supabase_realtime add table public.spoon_entries;
alter publication supabase_realtime add table public.spoon_repayments;
