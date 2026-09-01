import Image from "next/image";
import { cn } from "@/lib/cn";

export function LogoMark({ className, size = 128 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="Finora"
      width={size}
      height={size}
      className={cn("h-8 w-8 rounded-[22%]", className)}
      priority
    />
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="text-xl font-extrabold tracking-tight text-foreground">Finora</span>
    </span>
  );
}
