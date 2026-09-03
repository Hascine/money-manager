-- Budget pots (envelope budgeting): a purpose-based bucket independent of
-- which account physically holds the money. Categories classify *what kind*
-- of transaction this is; pots track a *running, rolling balance* toward a
-- purpose (Tabungan, Jajan, Kasih orang tua, ...). A single expense can carry
-- both — they answer different questions.

create table pots (
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references spaces(id),
  name       text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_pots_space on pots(space_id) where deleted_at is null;

alter table pots enable row level security;

-- pot_entries is the pot's own ledger, separate from transactions, holding
-- only the movements that aren't already an expense/income row: manual
-- allocations (e.g. splitting a paycheck across several pots) and transfers
-- between pots. Spending against a pot is read live from transactions via
-- pot_id below — never mirrored here, so there's nothing to keep in sync.
create type pot_entry_type as enum ('allocation', 'transfer_in', 'transfer_out');

create table pot_entries (
  id         uuid primary key default gen_random_uuid(),
  pot_id     uuid not null references pots(id),
  space_id   uuid not null references spaces(id),
  type       pot_entry_type not null,
  amount     numeric(14, 2) not null check (amount > 0),
  note       text,
  entry_date date not null default current_date,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_pot_entries_pot on pot_entries(pot_id) where deleted_at is null;
create index idx_pot_entries_space on pot_entries(space_id) where deleted_at is null;

alter table pot_entries enable row level security;

-- Tagging a transaction with a pot is optional, exactly like category_id —
-- set on an expense, it draws the pot down; set on an income, it funds the
-- pot directly.
alter table transactions add column pot_id uuid references pots(id);

-- Balance is always computed, never stored (same philosophy as
-- account_balances in 010_views_balances.sql).
create view pot_balances
with (security_invoker = true) as
select
  p.id as pot_id,
  p.space_id,
  coalesce(sum(
    case
      when pe.type in ('allocation', 'transfer_in') then pe.amount
      when pe.type = 'transfer_out' then -pe.amount
    end
  ), 0)
  + coalesce((
      select sum(t.amount) from transactions t
      where t.pot_id = p.id and t.type = 'income' and t.deleted_at is null
    ), 0)
  - coalesce((
      select sum(t.amount) from transactions t
      where t.pot_id = p.id and t.type = 'expense' and t.deleted_at is null
    ), 0)
  as balance
from pots p
left join pot_entries pe on pe.pot_id = p.id and pe.deleted_at is null
where p.deleted_at is null
group by p.id;

-- RLS -------------------------------------------------------------------

create policy pots_select on pots for select
  using (is_space_member(space_id));

create policy pots_insert on pots for insert
  with check (has_space_role(space_id, array['owner', 'admin', 'member']::member_role[]));

create policy pots_update on pots for update
  using (has_space_role(space_id, array['owner', 'admin']::member_role[]))
  with check (has_space_role(space_id, array['owner', 'admin']::member_role[]));

create policy pot_entries_select on pot_entries for select
  using (is_space_member(space_id));

create policy pot_entries_insert on pot_entries for insert
  with check (has_space_role(space_id, array['owner', 'admin', 'member']::member_role[]));

create policy pot_entries_update on pot_entries for update
  using (has_space_role(space_id, array['owner', 'admin']::member_role[]))
  with check (has_space_role(space_id, array['owner', 'admin']::member_role[]));

-- Realtime ----------------------------------------------------------------

alter publication supabase_realtime add table pots;
alter publication supabase_realtime add table pot_entries;
