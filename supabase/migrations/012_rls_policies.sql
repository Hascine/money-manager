-- Every "delete" in Finora is a soft delete via UPDATE — there are no hard-delete
-- policies anywhere, so deleted_at transitions are what the UI/Realtime treat as removal.

-- profiles --------------------------------------------------------------

create policy profiles_select on profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from space_members sm1
      join space_members sm2 on sm1.space_id = sm2.space_id
      where sm1.profile_id = auth.uid() and sm1.deleted_at is null
        and sm2.profile_id = profiles.id and sm2.deleted_at is null
    )
  );

create policy profiles_update on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- spaces ------------------------------------------------------------------
-- No insert policy: all space creation goes through create_collaborative_space()
-- (017_space_rpcs.sql) or the handle_new_user trigger, so a space row is never
-- created without its first space_members(owner) row in the same transaction.

create policy spaces_select on spaces for select
  using (is_space_member(id));

create policy spaces_update on spaces for update
  using (has_space_role(id, array['owner', 'admin']::member_role[]))
  with check (has_space_role(id, array['owner', 'admin']::member_role[]));

-- space_members -------------------------------------------------------------
-- No insert policy for regular clients: joining happens via redeem_invite() RPC
-- (017_space_rpcs.sql), which runs as SECURITY DEFINER.

create policy space_members_select on space_members for select
  using (is_space_member(space_id));

create policy space_members_update on space_members for update
  using (
    has_space_role(space_id, array['owner']::member_role[])
    or profile_id = auth.uid()
  )
  with check (
    has_space_role(space_id, array['owner']::member_role[])
    or profile_id = auth.uid()
  );

-- space_invites ---------------------------------------------------------------
-- No select policy needed for redemption: redeem_invite() is SECURITY DEFINER
-- and looks up the code itself, bypassing RLS for that one controlled lookup.

create policy space_invites_select on space_invites for select
  using (has_space_role(space_id, array['owner', 'admin']::member_role[]));

create policy space_invites_insert on space_invites for insert
  with check (
    has_space_role(space_id, array['owner', 'admin']::member_role[])
    and exists (select 1 from spaces where id = space_id and type = 'COLLABORATIVE')
  );

create policy space_invites_update on space_invites for update
  using (has_space_role(space_id, array['owner', 'admin']::member_role[]))
  with check (has_space_role(space_id, array['owner', 'admin']::member_role[]));

-- accounts ------------------------------------------------------------------

create policy accounts_select on accounts for select
  using (is_space_member(space_id));

create policy accounts_insert on accounts for insert
  with check (has_space_role(space_id, array['owner', 'admin']::member_role[]));

create policy accounts_update on accounts for update
  using (has_space_role(space_id, array['owner', 'admin']::member_role[]))
  with check (has_space_role(space_id, array['owner', 'admin']::member_role[]));

-- categories ------------------------------------------------------------------

create policy categories_select on categories for select
  using (is_space_member(space_id));

create policy categories_insert on categories for insert
  with check (has_space_role(space_id, array['owner', 'admin', 'member']::member_role[]));

create policy categories_update on categories for update
  using (has_space_role(space_id, array['owner', 'admin']::member_role[]))
  with check (has_space_role(space_id, array['owner', 'admin']::member_role[]));

-- transactions ------------------------------------------------------------------
-- transfer_in/transfer_out rows are never client-insertable, only via create_transfer().
-- Direct edits to transfer legs are additionally blocked by a trigger (013_guard_triggers.sql).

create policy transactions_select on transactions for select
  using (is_space_member(space_id));

create policy transactions_insert on transactions for insert
  with check (
    has_space_role(space_id, array['owner', 'admin', 'member']::member_role[])
    and type in ('income', 'expense')
  );

create policy transactions_update on transactions for update
  using (has_space_role(space_id, array['owner', 'admin']::member_role[]))
  with check (has_space_role(space_id, array['owner', 'admin']::member_role[]));

-- transfers ------------------------------------------------------------------
-- RLS enabled with zero write policies = deny-all for regular clients. All writes
-- happen exclusively through the SECURITY DEFINER RPCs in 016_transfer_rpcs.sql,
-- which is what keeps both transaction legs + this row atomically consistent.

create policy transfers_select on transfers for select
  using (is_space_member(from_space_id) or is_space_member(to_space_id));
