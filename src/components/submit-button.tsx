"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/plate";

export function SubmitButton({
  children,
  variant = "primary",
  className,
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "form">) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} className={className} pending={pending}>
      {children}
    </Button>
  );
}
