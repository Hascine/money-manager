import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** The "what do you want to add?" menu, shared by BottomNav (mobile) and
 * SideRail (desktop). It lives here because the two used to drift: the rail's
 * + button linked straight to /transactions/new, which offers only income and
 * expense, leaving transfers unreachable on desktop entirely. */
export function addOptions(spaceId: string, t: Dictionary) {
  return [
    {
      href: `/app/${spaceId}/transactions/new?type=income`,
      label: t.navAddIncome,
      icon: ArrowDownLeft,
      tint: "text-success",
    },
    {
      href: `/app/${spaceId}/transactions/new?type=expense`,
      label: t.navAddExpense,
      icon: ArrowUpRight,
      tint: "text-danger",
    },
    {
      href: `/app/${spaceId}/transfer/new`,
      label: t.navAddTransfer,
      icon: ArrowLeftRight,
      tint: "text-brand-from",
    },
  ];
}
