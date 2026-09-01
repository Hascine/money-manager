-- Invite links/codes to join a COLLABORATIVE space. Personal spaces never have invites.

create table space_invites (
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references spaces(id) on delete cascade,
  code       text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  role       member_role not null default 'member',
  created_by uuid not null references profiles(id),
  max_uses   integer,
  uses_count integer not null default 0,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_space_invites_space on space_invites(space_id);

alter table space_invites enable row level security;
