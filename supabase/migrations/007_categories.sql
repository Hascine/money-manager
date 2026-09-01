create table categories (
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references spaces(id),
  name       text not null,
  type       category_type not null,
  parent_id  uuid references categories(id),
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_categories_space on categories(space_id) where deleted_at is null;

alter table categories enable row level security;
