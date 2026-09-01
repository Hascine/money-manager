-- Every user automatically gets one Personal space the moment they sign up.

create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_space_id uuid;
  v_display_name text := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    split_part(new.email, '@', 1)
  );
begin
  insert into profiles (id, display_name, avatar_url)
  values (new.id, v_display_name, new.raw_user_meta_data ->> 'avatar_url');

  insert into spaces (type, name, created_by)
  values ('PERSONAL', v_display_name || '''s Space', new.id)
  returning id into v_space_id;

  insert into space_members (space_id, profile_id, role, joined_at)
  values (v_space_id, new.id, 'owner', now());

  perform seed_default_categories(v_space_id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
