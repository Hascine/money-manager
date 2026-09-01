import { createClient } from "@/lib/supabase/server";

/** account_balances is a view with no foreign key back to accounts, so PostgREST
 * can't embed it in an `accounts.select()` — fetch it separately and merge in JS. */
export async function getAccountBalances(spaceId: string): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("account_balances")
    .select("account_id, balance")
    .eq("space_id", spaceId);

  return new Map((data ?? []).map((row) => [row.account_id, row.balance]));
}
