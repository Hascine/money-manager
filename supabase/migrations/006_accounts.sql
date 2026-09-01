-- A single space_id replaces v1's owner_type/user_id/family_id split entirely:
-- a personal space's sole member already acts as the "user owner".

create table accounts (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid not null references spaces(id),
  name            text not null,
  type            account_type not null,
  provider        text,
  account_number  text,
  initial_balance numeric(14, 2) not null default 0,
  is_active       boolean not null default true,
  created_by      uuid not null references profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index idx_accounts_space on accounts(space_id) where deleted_at is null;

alter table accounts enable row level security;
