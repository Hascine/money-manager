-- Shared default-category seeding, reused by both the auto-created personal
-- space (015_new_user_trigger.sql) and create_collaborative_space (017_space_rpcs.sql).

create function seed_default_categories(p_space_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into categories (space_id, name, type) values
    (p_space_id, 'Gaji', 'income'),
    (p_space_id, 'Makan', 'expense'),
    (p_space_id, 'Transport', 'expense'),
    (p_space_id, 'Anak', 'expense'),
    (p_space_id, 'Rumah Tangga', 'expense'),
    (p_space_id, 'Internet / PLN / WiFi', 'expense'),
    (p_space_id, 'Kesehatan', 'expense'),
    (p_space_id, 'Tabungan', 'expense');
end;
$$;
