import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring/30";

const variants = {
  primary: "brand-gradient text-white shadow-lg shadow-violet-900/10 hover:brightness-110",
  secondary:
    "bg-surface-muted text-foreground border border-border hover:bg-border/60",
  ghost: "text-foreground-muted hover:text-foreground hover:bg-surface-muted",
  danger: "bg-danger text-white hover:brightness-110",
};

const sizes = {
  md: "h-12 px-5",
  lg: "h-14 px-6 text-lg",
  icon: "h-12 w-12",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
