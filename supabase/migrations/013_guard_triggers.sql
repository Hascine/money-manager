-- Structural invariants that RLS policies alone can't express.

-- spaces.type and spaces.created_by are immutable, and a PERSONAL space can never
-- be soft-deleted while the account exists.
create function protect_space_immutable_fields()
returns trigger
language plpgsql
as $$
begin
  if new.type is distinct from old.type then
    raise exception 'space type cannot be changed';
  end if;
  if new.created_by is distinct from old.created_by then
    raise exception 'space owner cannot be changed';
  end if;
  if old.type = 'PERSONAL' and new.deleted_at is not null and old.deleted_at is null then
    raise exception 'a personal space cannot be deleted';
  end if;
  return new;
end;
$$;

create trigger trg_protect_space_immutable_fields
  before update on spaces
  for each row execute function protect_space_immutable_fields();

-- A personal space's sole membership row can never change or be removed, and a
-- collaborative space can never be left with zero active owners.
create function guard_membership_changes()
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

create trigger trg_guard_membership_changes
  before update on space_members
  for each row execute function guard_membership_changes();

-- Transfer legs (transfer_in/transfer_out transactions) may only be written by
-- the create_transfer/update_transfer/delete_transfer RPCs, never edited directly.
create function protect_transfer_legs()
returns trigger
language plpgsql
as $$
begin
  if old.type in ('transfer_in', 'transfer_out') then
    raise exception 'transfer transactions can only be modified via the transfer functions';
  end if;
  return new;
end;
$$;

create trigger trg_protect_transfer_legs
  before update on transactions
  for each row execute function protect_transfer_legs();
