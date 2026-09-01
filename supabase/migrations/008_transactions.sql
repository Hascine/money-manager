-- No client_id/sync_status: Finora is fully online (Supabase Realtime instead of delay-sync).

create table transactions (
  id               uuid primary key default gen_random_uuid(),
  space_id         uuid not null references spaces(id),
  account_id       uuid not null references accounts(id),
  category_id      uuid references categories(id),
  created_by       uuid not null references profiles(id),
  type             transaction_type not null,
  amount           numeric(14, 2) not null check (amount > 0),
  transaction_date date not null,
  note             text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create index idx_transactions_space_date on transactions(space_id, transaction_date desc) where deleted_at is null;
create index idx_transactions_account on transactions(account_id) where deleted_at is null;

alter table transactions enable row level security;

-- space_id is derived from the account, never trusted from the client, so RLS/Realtime
-- filters on it are safe and a client can never smuggle a transaction into another space.
create function set_transaction_space_id()
returns trigger
language plpgsql
as $$
begin
  select space_id into new.space_id from accounts where id = new.account_id;
  return new;
end;
$$;

create trigger trg_set_transaction_space_id
  before insert or update of account_id on transactions
  for each row execute function set_transaction_space_id();
