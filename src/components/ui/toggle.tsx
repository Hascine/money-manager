export function Toggle({
  name,
  defaultChecked,
  label,
  hint,
}: {
  name: string;
  defaultChecked?: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-1">
      <span className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="text-sm text-foreground-muted">{hint}</span>}
      </span>
      <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
        <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-7 w-12 rounded-full bg-surface-muted transition-colors peer-checked:bg-brand-from" />
        <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
