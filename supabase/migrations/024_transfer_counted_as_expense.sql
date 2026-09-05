-- A transfer can cross into a completely different space (e.g. sending
-- money to a co-member's personal wallet) — from the *sending* space's
-- point of view that's often a real expense (allowance given, bill paid on
-- someone's behalf), not an internal shuffle. Opt-in, defaults off, so a
-- transfer between your own accounts stays invisible to reports as before.
alter table transfers add column counted_as_expense boolean not null default false;

drop function if exists create_transfer(uuid, uuid, numeric, date, text, uuid);
create function create_transfer(
  p_from_account_id    uuid,
  p_to_account_id      uuid,
  p_amount             numeric,
  p_transfer_date      date,
  p_note               text default null,
  p_pot_id             uuid default null,
  p_counted_as_expense boolean default false
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

  if p_pot_id is not null and not exists (
    select 1 from pots where id = p_pot_id and space_id = v_from_space and deleted_at is null
  ) then
    raise exception 'pot not found in source space';
  end if;

  if not exists (
    select 1 from get_transfer_targets(v_from_space) t where t.account_id = p_to_account_id
  ) then
    raise exception 'destination account not reachable from source space';
  end if;

  insert into transactions (account_id, type, amount, transaction_date, note, pot_id, created_by)
  values (p_from_account_id, 'transfer_out', p_amount, p_transfer_date, p_note, p_pot_id, auth.uid())
  returning id into v_out_tx;

  insert into transactions (account_id, type, amount, transaction_date, note, created_by)
  values (p_to_account_id, 'transfer_in', p_amount, p_transfer_date, p_note, auth.uid())
  returning id into v_in_tx;

  insert into transfers (
    from_account_id, to_account_id, from_space_id, to_space_id,
    out_transaction_id, in_transaction_id, amount, transfer_date, note, counted_as_expense, created_by
  )
  values (
    p_from_account_id, p_to_account_id, v_from_space, v_to_space,
    v_out_tx, v_in_tx, p_amount, p_transfer_date, p_note, p_counted_as_expense, auth.uid()
  )
  returning id into v_transfer_id;

  return v_transfer_id;
end;
$$;

revoke all on function create_transfer(uuid, uuid, numeric, date, text, uuid, boolean) from public;
grant execute on function create_transfer(uuid, uuid, numeric, date, text, uuid, boolean) to authenticated;

drop function if exists update_transfer(uuid, numeric, date, text, uuid);
create function update_transfer(
  p_transfer_id        uuid,
  p_amount             numeric,
  p_transfer_date      date,
  p_note               text default null,
  p_pot_id             uuid default null,
  p_counted_as_expense boolean default false
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

  if p_pot_id is not null and not exists (
    select 1 from pots where id = p_pot_id and space_id = v_transfer.from_space_id and deleted_at is null
  ) then
    raise exception 'pot not found in source space';
  end if;

  perform set_config('finora.allow_transfer_leg_write', 'true', true);

  update transactions set amount = p_amount, transaction_date = p_transfer_date, note = p_note, pot_id = p_pot_id
  where id = v_transfer.out_transaction_id;

  update transactions set amount = p_amount, transaction_date = p_transfer_date, note = p_note
  where id = v_transfer.in_transaction_id;

  update transfers
  set amount = p_amount, transfer_date = p_transfer_date, note = p_note, counted_as_expense = p_counted_as_expense
  where id = p_transfer_id;
end;
$$;

revoke all on function update_transfer(uuid, numeric, date, text, uuid, boolean) from public;
grant execute on function update_transfer(uuid, numeric, date, text, uuid, boolean) to authenticated;
