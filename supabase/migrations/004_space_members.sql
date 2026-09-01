create table space_members (
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references spaces(id) on delete cascade,
  profile_id uuid not null references profiles(id),
  role       member_role not null,
  invited_by uuid references profiles(id),
  joined_at  timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index one_active_membership
  on space_members (space_id, profile_id)
  where deleted_at is null;

create index idx_space_members_profile on space_members(profile_id) where deleted_at is null;

alter table space_members enable row level security;
