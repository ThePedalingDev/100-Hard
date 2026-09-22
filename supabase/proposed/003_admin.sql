-- Owner requested 2026-09-22: admin locker for markusfourie@icloud.com.
-- Edit any challenge (name/dates), list accounts, delete challenges.

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'markusfourie@icloud.com'
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
where lower(email) = 'markusfourie@icloud.com';

create or replace function public.admin_list_accounts()
returns table (
  id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  active_challenge_id uuid
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    u.id,
    u.email::text,
    p.display_name,
    u.created_at,
    p.active_challenge_id
  from auth.users u
  left join public.profiles p on p.id = u.id
  where private.is_admin()
  order by u.created_at desc;
$$;

revoke all on function public.admin_list_accounts() from public;
grant execute on function public.admin_list_accounts() to authenticated;

drop policy if exists challenges_admin_all on public.challenges;
create policy challenges_admin_all on public.challenges
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists members_admin_select on public.challenge_members;
create policy members_admin_select on public.challenge_members
  for select to authenticated
  using (private.is_admin());

drop policy if exists profiles_admin_select on public.profiles;
create policy profiles_admin_select on public.profiles
  for select to authenticated
  using (private.is_admin());

-- Admin can list every account, including people outside the admin's challenges.
-- Avatar files stayed owner-or-teammate only, so those photos 404'd on Admin.
drop policy if exists avatars_admin_read on storage.objects;
create policy avatars_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and private.is_admin());
