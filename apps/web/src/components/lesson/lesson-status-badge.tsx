import type { LessonStatus } from "@nederstart/shared";
import { cn } from "@/lib/utils";

const labels: Record<LessonStatus, string> = {
  locked: "Locked",
  available: "Available",
  in_progress: "In progress",
  completed: "Completed"
};

const styles: Record<LessonStatus, string> = {
  locked: "bg-brand-border text-brand-muted",
  available: "bg-[#E7F2EE] text-brand-primary",
  in_progress: "bg-[#FFF3E8] text-brand-warning",
  completed: "bg-[#E3F3EC] text-brand-success"
};

export function LessonStatusBadge({ status }: { status: LessonStatus }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", styles[status])}>
      {labels[status]}
    </span>
  );
}
