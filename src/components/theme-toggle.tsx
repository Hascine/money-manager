"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useTranslations } from "@/components/language-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const t = useTranslations();

  const options = [
    { value: "light", label: t.themeLight, icon: Sun },
    { value: "dark", label: t.themeDark, icon: Moon },
    { value: "system", label: t.themeSystem, icon: Monitor },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface-muted p-1.5">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-sm font-medium transition-colors",
            mounted && theme === value
              ? "bg-surface text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          <Icon size={20} strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  );
}
