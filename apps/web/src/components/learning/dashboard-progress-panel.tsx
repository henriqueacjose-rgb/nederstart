"use client";

import { useEffect, useState } from "react";
import type { LessonSummary, LevelSummary } from "@nederstart/shared";
import {
  loadRemoteProgress,
  mergeLessonsWithStoredProgress,
  mergeLevelsWithStoredProgress,
  subscribeToProgress
} from "@/lib/learning/progress-store";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/progress-bar";

export function DashboardProgressPanel({
  initialLessons,
  initialLevels
}: {
  initialLessons: LessonSummary[];
  initialLevels: LevelSummary[];
}) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    void loadRemoteProgress();
    return subscribeToProgress(() => setVersion((value) => value + 1));
  }, []);

  const mergedLessons = mergeLessonsWithStoredProgress(initialLessons);
  const mergedLevels = mergeLevelsWithStoredProgress(initialLevels, mergedLessons);
  const currentLesson =
    mergedLessons.find((lesson) => lesson.status === "in_progress") ??
    mergedLessons.find((lesson) => lesson.status === "available") ??
    mergedLessons[0];
  const currentLevel = mergedLevels.find((item) => item.code === currentLesson.levelCode) ?? mergedLevels[0];
  const completedLessons = mergedLessons.filter((lesson) => lesson.status === "completed").length;
  const totalLessons = mergedLessons.length;
  const overallProgress = Math.round(
    mergedLessons.reduce((sum, lesson) => sum + lesson.progress, 0) / mergedLessons.length
  );

  return (
    <>
      <Card className="grid gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-accent">{currentLesson.code}</p>
          <h2 className="mt-1 text-2xl font-bold text-brand-text">{currentLesson.title}</h2>
          <p className="mt-2 text-sm text-brand-muted">{currentLesson.objective}</p>
        </div>
        <ProgressBar value={currentLesson.progress} label="Current lesson" />
        <ButtonLink href={`/lessons/${currentLesson.code}`} className="w-full sm:w-fit">
          Continue lesson
        </ButtonLink>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-brand-text">{currentLevel.title}</h2>
          <p className="mt-2 text-sm text-brand-muted">{currentLevel.description}</p>
          <div className="mt-4">
            <ProgressBar value={currentLevel.progress} label="Level progress" />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-brand-text">Course progress</h2>
          <p className="mt-2 text-sm text-brand-muted">
            {completedLessons} of {totalLessons} lessons completed. Overall progress is {overallProgress}%.
          </p>
        </Card>
      </div>
    </>
  );
}
