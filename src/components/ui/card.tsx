import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-surface p-5 shadow-sm shadow-black/[0.03]",
        className
      )}
      {...props}
    />
  );
}
