"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

const controlClass =
  "h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-4 focus:ring-focus-ring/25 focus:border-focus-ring";

function formatGroups(digits: string) {
  return digits ? Number(digits).toLocaleString("id-ID") : "";
}

function toDigits(raw: string) {
  // Strips everything but digits, then drops leading zeros so typing after
  // a lone "0" replaces it instead of leaving it stuck in front (the mobile
  // annoyance a plain type="number" input has with defaultValue={0}).
  return raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

/** A Rupiah amount field: renders as a plain, empty-by-default text input
 * with live thousands-grouping (e.g. "1.500.000") instead of a native
 * type="number" input, which can't group digits and forces a leading "0"
 * you have to delete before typing. Submits the raw integer via a paired
 * hidden input under `name` — IDR amounts never carry cents in this app
 * (see formatIDR), so this is whole-rupiah only. */
export function AmountInput({
  name,
  defaultValue,
  required,
  className,
}: {
  name: string;
  defaultValue?: number;
  required?: boolean;
  className?: string;
}) {
  const [digits, setDigits] = useState(defaultValue ? String(Math.round(defaultValue)) : "");
  const id = useId();

  return (
    <>
      <input type="hidden" name={name} value={digits} />
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
        placeholder="0"
        value={formatGroups(digits)}
        onChange={(e) => setDigits(toDigits(e.target.value))}
        className={cn(controlClass, className)}
      />
    </>
  );
}
