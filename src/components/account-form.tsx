import { Field, Input, Select } from "@/components/ui/field";
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
    account_number?: string | null;
    initial_balance?: number;
  };
}) {
  const labels = getAccountTypeLabels(t);
  const types = Object.keys(labels) as AccountType[];

  return (
    <>
      <Field label={t.fieldAccountName}>
        <Input name="name" required defaultValue={defaultValues?.name} placeholder="BCA Badz" />
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
      <Field label={t.fieldAccountNumber}>
        <Input name="account_number" defaultValue={defaultValues?.account_number ?? ""} />
      </Field>
      {defaultValues === undefined && (
        <Field label={t.fieldInitialBalance}>
          <Input name="initial_balance" type="number" step="0.01" defaultValue={0} />
        </Field>
      )}
    </>
  );
}
