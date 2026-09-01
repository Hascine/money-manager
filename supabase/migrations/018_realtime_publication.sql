-- Realtime postgres_changes enforces the same RLS as normal queries for
-- authenticated clients, so these are safe to expose broadly.

alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table accounts;
alter publication supabase_realtime add table transfers;
alter publication supabase_realtime add table space_members;
alter publication supabase_realtime add table space_invites;
