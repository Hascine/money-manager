-- Populated exclusively by the create_transfer/update_transfer/delete_transfer RPCs
-- (016_transfer_rpcs.sql) — never by direct client insert (see 012_rls_policies.sql).

create table transfers (
  id                 uuid primary key default gen_random_uuid(),
  from_account_id    uuid not null references accounts(id),
  to_account_id      uuid not null references accounts(id),
  from_space_id      uuid not null references spaces(id),
  to_space_id        uuid not null references spaces(id),
  out_transaction_id uuid not null references transactions(id),
  in_transaction_id  uuid not null references transactions(id),
  amount             numeric(14, 2) not null check (amount > 0),
  transfer_date      date not null,
  note               text,
  created_by         uuid not null references profiles(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz,
  check (from_account_id <> to_account_id)
);

create index idx_transfers_from_space on transfers(from_space_id) where deleted_at is null;
create index idx_transfers_to_space on transfers(to_space_id) where deleted_at is null;

alter table transfers enable row level security;
