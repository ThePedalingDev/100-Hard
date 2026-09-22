-- Allow authenticated users to resolve an invite code without exposing all challenges.
-- RLS on public.challenges only permits select for members/creators, which blocked join-by-code.

create or replace function public.get_challenge_by_invite_code(p_code text)
returns table (
  id uuid,
  start_date date,
  end_date date,
  member_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id,
    c.start_date,
    c.end_date,
    count(cm.id)::bigint as member_count
  from public.challenges c
  left join public.challenge_members cm on cm.challenge_id = c.id
  where c.invite_code = lower(trim(p_code))
  group by c.id, c.start_date, c.end_date
  limit 1;
$$;

revoke all on function public.get_challenge_by_invite_code(text) from public;
grant execute on function public.get_challenge_by_invite_code(text) to authenticated;
