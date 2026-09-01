-- SECURITY DEFINER is required: space_members' own RLS policy calls these,
-- and if they ran with the caller's RLS-restricted privileges they would
-- recurse into the very policy that invoked them.

create function is_space_member(p_space_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from space_members
    where space_id = p_space_id and profile_id = auth.uid() and deleted_at is null
  );
$$;

create function has_space_role(p_space_id uuid, p_roles member_role[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from space_members
    where space_id = p_space_id and profile_id = auth.uid()
      and role = any(p_roles) and deleted_at is null
  );
$$;
