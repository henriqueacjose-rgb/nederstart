import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-component border border-brand-border bg-white px-3 text-base text-brand-text outline-none transition focus:border-brand-secondary",
        className,
      )}
      {...props}
    />
  );
}

export function SelectInput({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-component border border-brand-border bg-white px-3 text-base text-brand-text outline-none transition focus:border-brand-secondary",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-brand-text">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-brand-muted">{hint}</span> : null}
    </label>
  );
}
