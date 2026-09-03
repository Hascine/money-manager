"use client";

import { useMemo, useState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/language-provider";

interface TransferTarget {
  account_id: string;
  account_name: string;
  account_type: string;
  space_id: string;
  space_name: string;
  space_type: "PERSONAL" | "COLLABORATIVE";
  owner_display_name: string | null;
}

export function TransferForm({
  action,
  fromAccounts,
  targets,
  pots,
}: {
  action: (formData: FormData) => void;
  fromAccounts: { id: string; name: string }[];
  targets: TransferTarget[];
  pots: { id: string; name: string }[];
}) {
  const t = useTranslations();
  const [fromAccountId, setFromAccountId] = useState(fromAccounts[0]?.id ?? "");

  // Group destinations by space so it reads like the space switcher: your own
  // spaces first, then personal wallets of co-members in a collaborative space.
  const groups = useMemo(() => {
    const bySpace = new Map<string, { name: string; type: string; owner: string | null; accounts: TransferTarget[] }>();
    for (const target of targets) {
      if (target.account_id === fromAccountId) continue;
      const key = target.space_id;
      if (!bySpace.has(key)) {
        bySpace.set(key, {
          name: target.space_name,
          type: target.space_type,
          owner: target.owner_display_name,
          accounts: [],
        });
      }
      bySpace.get(key)!.accounts.push(target);
    }
    return Array.from(bySpace.values());
  }, [targets, fromAccountId]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label={t.fieldFromAccount}>
        <Select
          name="from_account_id"
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
        >
          {fromAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t.fieldToAccount}>
        <Select name="to_account_id" required>
          {groups.map((group) => (
            <optgroup
              key={group.name}
              label={group.type === "PERSONAL" ? `${group.owner ?? group.name} ${t.personalSuffix}` : group.name}
            >
              {group.accounts.map((account) => (
                <option key={account.account_id} value={account.account_id}>
                  {account.account_name}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      {pots.length > 0 && (
        <Field label={t.fieldPot}>
          <Select name="pot_id" defaultValue="">
            <option value="">-</option>
            {pots.map((pot) => (
              <option key={pot.id} value={pot.id}>
                {pot.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label={t.fieldAmount}>
        <AmountInput name="amount" required />
      </Field>

      <Field label={t.fieldDate}>
        <Input name="transfer_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
      </Field>

      <Field label={t.fieldNote}>
        <Input name="note" />
      </Field>

      <Button type="submit" size="lg" className="mt-2 w-full">
        {t.sendTransfer}
      </Button>
    </form>
  );
}
