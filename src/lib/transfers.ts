import { createClient } from "@/lib/supabase/server";

/** Candidate destination accounts for a transfer out of `sourceSpaceId` —
 * includes personal-space wallets of co-members when the source is a
 * collaborative space (see supabase/migrations/016_transfer_rpcs.sql). */
export async function getTransferTargets(sourceSpaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_transfer_targets", {
    p_source_space_id: sourceSpaceId,
  });
  if (error) throw error;
  return data;
}

export async function createTransfer(input: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  transferDate: string;
  note?: string | null;
  potId?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_transfer", {
    p_from_account_id: input.fromAccountId,
    p_to_account_id: input.toAccountId,
    p_amount: input.amount,
    p_transfer_date: input.transferDate,
    p_note: input.note ?? null,
    p_pot_id: input.potId ?? null,
  });
  if (error) throw error;
  return data;
}

export async function updateTransfer(input: {
  transferId: string;
  amount: number;
  transferDate: string;
  note?: string | null;
  potId?: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_transfer", {
    p_transfer_id: input.transferId,
    p_amount: input.amount,
    p_transfer_date: input.transferDate,
    p_note: input.note ?? null,
    p_pot_id: input.potId ?? null,
  });
  if (error) throw error;
}

export async function deleteTransfer(transferId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_transfer", { p_transfer_id: transferId });
  if (error) throw error;
}

/** transfers has two FKs into accounts (from/to), so the embed must name
 * which one to resolve — same reason as the space_members double-FK-into-
 * profiles fix (settings/members/page.tsx). */
export async function getTransfer(transferId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transfers")
    .select(
      "id, amount, transfer_date, note, from_space_id, out_transaction_id, from_account:accounts!from_account_id(name), to_account:accounts!to_account_id(name)"
    )
    .eq("id", transferId)
    .is("deleted_at", null)
    .single();
  if (error) return null;

  const { data: outTx } = await supabase
    .from("transactions")
    .select("pot_id")
    .eq("id", data.out_transaction_id)
    .single();

  return { ...data, pot_id: outTx?.pot_id ?? null };
}
