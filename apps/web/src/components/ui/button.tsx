import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-white hover:bg-[#0d2c24]",
  secondary: "border border-brand-border bg-white text-brand-primary hover:bg-brand-background",
  ghost: "text-brand-primary hover:bg-brand-background"
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-component px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: ButtonVariant }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-component px-4 py-2 text-sm font-semibold transition",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
