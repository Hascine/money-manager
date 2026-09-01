-- Cross-space transfer mechanism.
--
-- RLS policies can't express "reveal these accounts only when the *source* is
-- this particular space" — that needs a runtime parameter, so it's an RPC.
-- get_transfer_targets returns only minimal identifying fields (no balance, no
-- account number) so widening visibility for transfer purposes never leaks a
-- co-member's personal financial detail.

create function get_transfer_targets(p_source_space_id uuid)
returns table (
  account_id         uuid,
  account_name       text,
  account_type       account_type,
  space_id           uuid,
  space_name         text,
  space_type         space_type,
  owner_display_name text
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not is_space_member(p_source_space_id) then
    raise exception 'not a member of source space';
  end if;

  return query
  select distinct
    a.id, a.name, a.type, s.id, s.name, s.type, p.display_name
  from accounts a
  join spaces s on s.id = a.space_id
  left join space_members owner_sm
    on owner_sm.space_id = s.id and owner_sm.role = 'owner' and owner_sm.deleted_at is null
  left join profiles p on p.id = owner_sm.profile_id
  where a.deleted_at is null
    and a.is_active
    and (
      -- (1) any space the caller already belongs to
      is_space_member(s.id)
      or
      -- (2) personal spaces of co-members of the source collaborative space
      (
        s.type = 'PERSONAL'
        and exists (
          select 1
          from space_members caller
          join space_members co
            on co.space_id = caller.space_id and co.deleted_at is null
          where caller.space_id = p_source_space_id
            and caller.profile_id = auth.uid()
            and caller.deleted_at is null
            and co.profile_id = owner_sm.profile_id
        )
      )
    );
end;
$$;

revoke all on function get_transfer_targets(uuid) from public;
grant execute on function get_transfer_targets(uuid) to authenticated;

-- Atomically creates both transaction legs + the transfers row. Any exception
-- rolls back everything already inserted in this call.
create function create_transfer(
  p_from_account_id uuid,
  p_to_account_id   uuid,
  p_amount          numeric,
  p_transfer_date   date,
  p_note            text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from_space  uuid;
  v_to_space    uuid;
  v_out_tx      uuid;
  v_in_tx       uuid;
  v_transfer_id uuid;
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  if p_from_account_id = p_to_account_id then
    raise exception 'cannot transfer to the same account';
  end if;

  select space_id into v_from_space from accounts where id = p_from_account_id and deleted_at is null;
  select space_id into v_to_space from accounts where id = p_to_account_id and deleted_at is null;
  if v_from_space is null or v_to_space is null then
    raise exception 'invalid account';
  end if;

  if not has_space_role(v_from_space, array['owner', 'admin', 'member']::member_role[]) then
    raise exception 'not authorized to send from source space';
  end if;

  if not exists (
    select 1 from get_transfer_targets(v_from_space) t where t.account_id = p_to_account_id
  ) then
    raise exception 'destination account not reachable from source space';
  end if;

  insert into transactions (account_id, type, amount, transaction_date, note, created_by)
  values (p_from_account_id, 'transfer_out', p_amount, p_transfer_date, p_note, auth.uid())
  returning id into v_out_tx;

  insert into transactions (account_id, type, amount, transaction_date, note, created_by)
  values (p_to_account_id, 'transfer_in', p_amount, p_transfer_date, p_note, auth.uid())
  returning id into v_in_tx;

  insert into transfers (
    from_account_id, to_account_id, from_space_id, to_space_id,
    out_transaction_id, in_transaction_id, amount, transfer_date, note, created_by
  )
  values (
    p_from_account_id, p_to_account_id, v_from_space, v_to_space,
    v_out_tx, v_in_tx, p_amount, p_transfer_date, p_note, auth.uid()
  )
  returning id into v_transfer_id;

  return v_transfer_id;
end;
$$;

revoke all on function create_transfer(uuid, uuid, numeric, date, text) from public;
grant execute on function create_transfer(uuid, uuid, numeric, date, text) to authenticated;

-- Edits both legs together, keeping them consistent. Only amount/date/note can
-- change (moving a transfer to different accounts is a delete + new transfer).
create function update_transfer(
  p_transfer_id   uuid,
  p_amount        numeric,
  p_transfer_date date,
  p_note          text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer transfers%rowtype;
begin
  select * into v_transfer from transfers where id = p_transfer_id and deleted_at is null;
  if not found then
    raise exception 'transfer not found';
  end if;
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  if not has_space_role(v_transfer.from_space_id, array['owner', 'admin']::member_role[]) then
    raise exception 'not authorized to edit this transfer';
  end if;

  update transactions set amount = p_amount, transaction_date = p_transfer_date, note = p_note
  where id in (v_transfer.out_transaction_id, v_transfer.in_transaction_id);

  update transfers set amount = p_amount, transfer_date = p_transfer_date, note = p_note
  where id = p_transfer_id;
end;
$$;

revoke all on function update_transfer(uuid, numeric, date, text) from public;
grant execute on function update_transfer(uuid, numeric, date, text) to authenticated;

create function delete_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer transfers%rowtype;
begin
  select * into v_transfer from transfers where id = p_transfer_id and deleted_at is null;
  if not found then
    raise exception 'transfer not found';
  end if;
  if not has_space_role(v_transfer.from_space_id, array['owner', 'admin']::member_role[]) then
    raise exception 'not authorized to delete this transfer';
  end if;

  update transactions set deleted_at = now()
  where id in (v_transfer.out_transaction_id, v_transfer.in_transaction_id);

  update transfers set deleted_at = now() where id = p_transfer_id;
end;
$$;

revoke all on function delete_transfer(uuid) from public;
grant execute on function delete_transfer(uuid) to authenticated;
