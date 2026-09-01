-- A space is the unifying container for accounts/categories/transactions.
-- PERSONAL: exactly one per user, auto-created on signup (see 015_new_user_trigger.sql).
-- COLLABORATIVE: family/couple spaces a user opts into.

create table spaces (
  id         uuid primary key default gen_random_uuid(),
  type       space_type not null,
  name       text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Guarantees exactly one active personal space per user at the database level,
-- so no code path (including bugs) can create a second one.
create unique index one_personal_space_per_user
  on spaces (created_by)
  where type = 'PERSONAL' and deleted_at is null;

alter table spaces enable row level security;
