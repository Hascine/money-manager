import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-base font-medium text-foreground-muted transition-colors hover:text-foreground"
    >
      <ArrowLeft size={18} />
      {label}
    </Link>
  );
}
