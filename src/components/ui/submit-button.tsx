"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg" | "icon";
  pendingChildren?: React.ReactNode;
}

/** Disables itself while its enclosing form action is in flight, so a
 * double-click (or a slow network + a second click) can't fire the same
 * server action twice — e.g. creating two collaborative spaces from one
 * "Create" click. */
export function SubmitButton({ children, pendingChildren, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} {...props}>
      {pending ? (pendingChildren ?? children) : children}
    </Button>
  );
}
