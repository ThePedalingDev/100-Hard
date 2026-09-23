-- Closing a day from the app failed with permission denied, so a failed day
-- never wrote its spoon. The public wrapper must run as the owner to call
-- the private finalizer. A day already marked failed still receives its spoon.

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

revoke all on function public.finalize_challenge_day(date) from public;
grant execute on function public.finalize_challenge_day(date) to authenticated;
