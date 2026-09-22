"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ButtonHTMLAttributes } from "react";

interface ConfirmSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg" | "icon";
  /** Shown in the browser's confirm dialog — say plainly what is about to happen. */
  confirmMessage: string;
  /** Renders a bare <button> instead of the styled Button, for the inline
   * text-link style destructive actions (remove member, revoke invite). */
  unstyled?: boolean;
}

/** Destructive actions ask before they fire. Deleting a transaction, archiving
 * an account or leaving a space is one tap away from data that can't be
 * recovered from the UI, so a mis-tap shouldn't be enough. Also disables
 * itself while the action is in flight, same as SubmitButton. */
export function ConfirmSubmitButton({
  children,
  confirmMessage,
  disabled,
  unstyled,
  variant,
  size,
  ...rest
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();
  const shared = {
    type: "submit" as const,
    disabled: disabled || pending,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!window.confirm(confirmMessage)) event.preventDefault();
    },
  };

  if (unstyled) {
    return (
      <button {...shared} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <Button {...shared} variant={variant} size={size} {...rest}>
      {children}
    </Button>
  );
}
