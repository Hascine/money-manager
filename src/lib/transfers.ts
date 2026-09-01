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
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_transfer", {
    p_from_account_id: input.fromAccountId,
    p_to_account_id: input.toAccountId,
    p_amount: input.amount,
    p_transfer_date: input.transferDate,
    p_note: input.note ?? null,
  });
  if (error) throw error;
  return data;
}
