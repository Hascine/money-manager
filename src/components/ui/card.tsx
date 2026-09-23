import { cn } from "@/lib/cn";

/** `cn` here is a plain join, not tailwind-merge — passing `p-0` alongside the
 * default `p-5` leaves both classes on the element and the stylesheet order
 * decides, which silently doubled the padding on every list card. `padded`
 * removes the default instead of trying to out-specify it. */
export function Card({
  className,
  padded = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-surface shadow-[0_2px_16px_rgba(15,23,42,0.05)]",
        padded && "p-5",
        className
      )}
      {...props}
    />
  );
}
