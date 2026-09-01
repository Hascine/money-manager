-- Companion RPCs so space creation and invite redemption never need loose
-- insert policies on spaces/space_members.

create function create_collaborative_space(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_space_id uuid;
begin
  insert into spaces (type, name, created_by)
  values ('COLLABORATIVE', p_name, auth.uid())
  returning id into v_space_id;

  insert into space_members (space_id, profile_id, role, joined_at)
  values (v_space_id, auth.uid(), 'owner', now());

  perform seed_default_categories(v_space_id);

  return v_space_id;
end;
$$;

revoke all on function create_collaborative_space(text) from public;
grant execute on function create_collaborative_space(text) to authenticated;

create function redeem_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite space_invites%rowtype;
begin
  select * into v_invite from space_invites where code = p_code;
  if not found then
    raise exception 'invalid invite code';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'invite has been revoked';
  end if;
  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'invite has expired';
  end if;
  if v_invite.max_uses is not null and v_invite.uses_count >= v_invite.max_uses then
    raise exception 'invite has reached its usage limit';
  end if;
  if is_space_member(v_invite.space_id) then
    raise exception 'already a member of this space';
  end if;

  insert into space_members (space_id, profile_id, role, invited_by, joined_at)
  values (v_invite.space_id, auth.uid(), v_invite.role, v_invite.created_by, now());

  update space_invites set uses_count = uses_count + 1 where id = v_invite.id;

  return v_invite.space_id;
end;
$$;

revoke all on function redeem_invite(text) from public;
grant execute on function redeem_invite(text) to authenticated;
