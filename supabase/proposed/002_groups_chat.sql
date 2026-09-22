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
