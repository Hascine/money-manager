-- Accounts can be excluded from the space's Total Balance figure (e.g. a
-- debt or investment account you track but don't want counted in everyday
-- cash).
alter table accounts add column include_in_total_balance boolean not null default true;

-- A standing monthly target for how much you plan to allocate across pots
-- (e.g. this month's paycheck) — purely informational, compared live against
-- this calendar month's allocation entries so "remaining to allocate" always
-- reflects what's actually been split into pots so far.
alter table spaces add column monthly_pot_budget numeric(14, 2);

create or replace view account_balances
with (security_invoker = true) as
select
  a.id as account_id,
  a.space_id,
  a.initial_balance + coalesce(sum(
    case
      when t.type in ('income', 'transfer_in') then t.amount
      when t.type in ('expense', 'transfer_out') then -t.amount
    end
  ), 0) as balance,
  a.include_in_total_balance
from accounts a
left join transactions t on t.account_id = a.id and t.deleted_at is null
where a.deleted_at is null
group by a.id;

create or replace view space_balances
with (security_invoker = true) as
select space_id, sum(balance) as total_balance
from account_balances
where include_in_total_balance
group by space_id;

-- protect_transfer_legs (013_guard_triggers.sql) blocks *any* update to a
-- transfer leg, including the one issued from inside update_transfer()/
-- delete_transfer() themselves — triggers fire on the underlying table
-- operation regardless of the calling function's SECURITY DEFINER context,
-- so as originally written those two RPCs could never actually succeed.
-- Fixed with a transaction-local bypass flag only those RPCs set.
create or replace function protect_transfer_legs()
returns trigger
language plpgsql
as $$
begin
  if old.type in ('transfer_in', 'transfer_out')
     and coalesce(current_setting('finora.allow_transfer_leg_write', true), '') <> 'true' then
    raise exception 'transfer transactions can only be modified via the transfer functions';
  end if;
  return new;
end;
$$;

-- Transfers can optionally draw from a pot on the source side (tagged on the
-- outgoing leg only — the destination account may live in a different space
-- entirely, e.g. a co-member's personal wallet, where the pot doesn't apply).
drop function if exists create_transfer(uuid, uuid, numeric, date, text);
create function create_transfer(
  p_from_account_id uuid,
  p_to_account_id   uuid,
  p_amount          numeric,
  p_transfer_date   date,
  p_note            text default null,
  p_pot_id          uuid default null
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

revoke all on function create_transfer(uuid, uuid, numeric, date, text, uuid) from public;
grant execute on function create_transfer(uuid, uuid, numeric, date, text, uuid) to authenticated;

-- Edits both legs together, keeping them consistent. Only amount/date/note/pot
-- can change (moving a transfer to different accounts is a delete + new transfer).
drop function if exists update_transfer(uuid, numeric, date, text);
create function update_transfer(
  p_transfer_id   uuid,
  p_amount        numeric,
  p_transfer_date date,
  p_note          text default null,
  p_pot_id        uuid default null
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

  update transfers set amount = p_amount, transfer_date = p_transfer_date, note = p_note
  where id = p_transfer_id;
end;
$$;

revoke all on function update_transfer(uuid, numeric, date, text, uuid) from public;
grant execute on function update_transfer(uuid, numeric, date, text, uuid) to authenticated;

create or replace function delete_transfer(p_transfer_id uuid)
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

  perform set_config('finora.allow_transfer_leg_write', 'true', true);

  update transactions set deleted_at = now()
  where id in (v_transfer.out_transaction_id, v_transfer.in_transaction_id);

  update transfers set deleted_at = now() where id = p_transfer_id;
end;
$$;
