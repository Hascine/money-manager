import { Field, Input, Select } from "@/components/ui/field";
import { AmountInput } from "@/components/ui/amount-input";
import { Toggle } from "@/components/ui/toggle";
import { getAccountTypeLabels } from "@/lib/account-icons";
import type { AccountType } from "@/lib/supabase/database.types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AccountFormFields({
  t,
  defaultValues,
}: {
  t: Dictionary;
  defaultValues?: {
    name?: string;
    type?: string;
    provider?: string | null;
    balance?: number;
    include_in_total_balance?: boolean;
  };
}) {
  const labels = getAccountTypeLabels(t);
  const types = Object.keys(labels) as AccountType[];

  return (
    <>
      <Field label={t.fieldAccountName}>
        <Input name="name" required defaultValue={defaultValues?.name} placeholder="BCA Utama" />
      </Field>
      <Field label={t.fieldAccountType}>
        <Select name="type" defaultValue={defaultValues?.type ?? "bank"}>
          {types.map((type) => (
            <option key={type} value={type}>
              {labels[type]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.fieldProvider}>
        <Input
          name="provider"
          defaultValue={defaultValues?.provider ?? ""}
          placeholder="BCA, GoPay, ShopeePay..."
        />
      </Field>
      {defaultValues === undefined ? (
        <Field label={t.fieldInitialBalance}>
          <AmountInput name="initial_balance" />
        </Field>
      ) : (
        <Field label={t.fieldCurrentBalance} hint={t.fieldCurrentBalanceHint}>
          <AmountInput name="balance" defaultValue={defaultValues.balance} />
        </Field>
      )}
      <Toggle
        name="include_in_total_balance"
        defaultChecked={defaultValues?.include_in_total_balance ?? true}
        label={t.fieldIncludeInTotal}
        hint={t.fieldIncludeInTotalHint}
      />
    </>
  );
}
