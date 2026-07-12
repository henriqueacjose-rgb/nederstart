import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn("rounded-component border border-brand-border bg-white p-4 shadow-soft", className)}
      {...props}
    />
  );
}
