-- space_members_update's RLS (012_rls_policies.sql) lets a member update their
-- own row so they can leave a space (soft-delete via deleted_at), but
-- "profile_id = auth.uid()" alone doesn't restrict which columns change —
-- without this, any member could PATCH their own row's role to 'owner'
-- directly via the API, bypassing the UI (which only lets an owner edit
-- roles) entirely.

create or replace function guard_membership_changes()
returns trigger
language plpgsql
as $$
declare
  v_space_type space_type;
  v_remaining_owners integer;
begin
  select type into v_space_type from spaces where id = new.space_id;

  if v_space_type = 'PERSONAL' then
    raise exception 'personal space membership cannot be changed';
  end if;

  if new.role is distinct from old.role
     and not has_space_role(new.space_id, array['owner']::member_role[]) then
    raise exception 'only an owner can change a member''s role';
  end if;

  if old.role = 'owner' and (new.role <> 'owner' or new.deleted_at is not null) then
    select count(*) into v_remaining_owners
    from space_members
    where space_id = new.space_id and role = 'owner' and deleted_at is null
      and id <> old.id;

    if v_remaining_owners = 0 then
      raise exception 'a collaborative space must always have at least one owner';
    end if;
  end if;

  return new;
end;
$$;
