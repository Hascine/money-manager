import { Banknote, Landmark, Smartphone, PiggyBank, Wallet } from "lucide-react";
import type { AccountType } from "@/lib/supabase/database.types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export const ACCOUNT_TYPE_ICON: Record<AccountType, typeof Wallet> = {
  cash: Banknote,
  bank: Landmark,
  ewallet: Smartphone,
  saving: PiggyBank,
  other: Wallet,
};

export function getAccountTypeLabels(t: Dictionary): Record<AccountType, string> {
  return {
    cash: t.accountTypeCash,
    bank: t.accountTypeBank,
    ewallet: t.accountTypeEwallet,
    saving: t.accountTypeSaving,
    other: t.accountTypeOther,
  };
}
