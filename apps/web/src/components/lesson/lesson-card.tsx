import type { LessonSummary } from "@nederstart/shared";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress/progress-bar";
import { LessonStatusBadge } from "@/components/lesson/lesson-status-badge";

export function LessonCard({ lesson }: { lesson: LessonSummary }) {
  const isLocked = lesson.status === "locked";
  const cta = lesson.status === "completed" ? "Review" : lesson.status === "in_progress" ? "Continue" : "Start";

  return (
    <Card className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-accent">{lesson.code}</p>
          <h3 className="mt-1 text-lg font-bold text-brand-text">{lesson.title}</h3>
          <p className="mt-1 text-sm text-brand-muted">{lesson.objective}</p>
        </div>
        <LessonStatusBadge status={lesson.status} />
      </div>
      <ProgressBar value={lesson.progress} label="Lesson progress" />
      <ButtonLink
        href={isLocked ? "#" : `/lessons/${lesson.code}`}
        variant={isLocked ? "secondary" : "primary"}
        className={isLocked ? "pointer-events-none opacity-50" : ""}
      >
        {isLocked ? "Locked" : cta}
      </ButtonLink>
    </Card>
  );
}
