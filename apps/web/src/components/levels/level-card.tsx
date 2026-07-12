import type { LevelSummary } from "@nederstart/shared";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress/progress-bar";

export function LevelCard({ level }: { level: LevelSummary }) {
  const disabled = level.status === "coming_soon";

  return (
    <Card className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-brand-accent">{level.lessonCount} lessons</p>
        <h3 className="mt-1 text-xl font-bold text-brand-text">{level.title}</h3>
        <p className="mt-2 text-sm text-brand-muted">{level.description}</p>
      </div>
      <ProgressBar value={level.progress} label="Level progress" />
      <ButtonLink
        href={disabled ? "#" : `/levels/${level.code}/lessons`}
        variant={disabled ? "secondary" : "primary"}
        className={disabled ? "pointer-events-none opacity-50" : ""}
      >
        {disabled ? "Coming soon" : level.progress > 0 ? "Continue" : "Open level"}
      </ButtonLink>
    </Card>
  );
}
