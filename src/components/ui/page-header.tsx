import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-1 text-base text-foreground-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
