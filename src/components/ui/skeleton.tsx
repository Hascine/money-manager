import { cn } from "@/lib/cn";

/** Placeholder block for loading.tsx screens. Shaped like the content it
 * stands in for, so the layout doesn't jump when the real data arrives. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-surface-muted", className)} aria-hidden="true" />;
}
