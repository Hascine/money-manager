import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const controlClass =
  "h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-4 focus:ring-focus-ring/25 focus:border-focus-ring";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground-muted">{label}</span>
      {children}
      {hint && <span className="text-sm text-foreground-muted">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(controlClass, "appearance-none pr-10", className)} {...props} />
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted"
      />
    </div>
  );
}
