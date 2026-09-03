import { Field, Input, Select } from "@/components/ui/field";
import { AmountInput } from "@/components/ui/amount-input";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function TransactionFormFields({
  t,
  accounts,
  categories,
  defaultValues,
}: {
  t: Dictionary;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
  defaultValues?: {
    type?: string;
    account_id?: string;
    category_id?: string | null;
    amount?: number;
    transaction_date?: string;
    note?: string | null;
  };
}) {
  return (
    <>
      <Field label={t.fieldType}>
        <Select name="type" defaultValue={defaultValues?.type ?? "expense"}>
          <option value="expense">{t.typeExpense}</option>
          <option value="income">{t.typeIncome}</option>
        </Select>
      </Field>
      <Field label={t.fieldAccount}>
        <Select name="account_id" required defaultValue={defaultValues?.account_id}>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.fieldCategory}>
        <Select name="category_id" defaultValue={defaultValues?.category_id ?? ""}>
          <option value="">-</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.fieldAmount}>
        <AmountInput name="amount" required defaultValue={defaultValues?.amount} />
      </Field>
      <Field label={t.fieldDate}>
        <Input
          name="transaction_date"
          type="date"
          required
          defaultValue={defaultValues?.transaction_date ?? new Date().toISOString().slice(0, 10)}
        />
      </Field>
      <Field label={t.fieldNote}>
        <Input name="note" defaultValue={defaultValues?.note ?? ""} />
      </Field>
    </>
  );
}
