import { percentLabel } from "@/lib/utils";

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm text-brand-muted">
        <span>{label ?? "Progress"}</span>
        <span>{percentLabel(safeValue)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-brand-border" aria-hidden="true">
        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
