import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/cn";

type Direction = "in" | "out";

/** The one place money is rendered. Keeps sign, colour and digit alignment
 * consistent — these three were previously re-derived at every call site.
 *
 * Colour is never the only signal: `flow` always prints an explicit +/−, and
 * callers pair it with a direction arrow or icon. */
export function Amount({
  value,
  direction,
  colorBySign,
  className,
}: {
  value: number;
  /** Inflow/outflow: prints an explicit +/− and tones the text. */
  direction?: Direction;
  /** For net figures that carry their own sign (e.g. balance, net total). */
  colorBySign?: boolean;
  className?: string;
}) {
  const tone = direction
    ? direction === "in"
      ? "text-success"
      : "text-danger"
    : colorBySign
      ? value >= 0
        ? "text-success"
        : "text-danger"
      : "text-foreground";

  return (
    <span className={cn("tabular", tone, className)}>
      {direction ? (direction === "in" ? "+" : "−") : ""}
      {formatIDR(value)}
    </span>
  );
}
