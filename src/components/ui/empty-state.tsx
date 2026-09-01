import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
        <Icon size={28} strokeWidth={1.75} />
      </div>
      <p className="text-lg font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-xs text-base text-foreground-muted">{description}</p>}
    </div>
  );
}
