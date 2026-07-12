"use client";

import { useEffect, useState } from "react";
import type { LessonSummary, LevelSummary } from "@nederstart/shared";
import {
  loadRemoteProgress,
  mergeLessonsWithStoredProgress,
  mergeLevelsWithStoredProgress,
  subscribeToProgress
} from "@/lib/learning/progress-store";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/progress-bar";

export function ProgressOverview({
  initialLevels,
  initialLessons
}: {
  initialLevels: LevelSummary[];
  initialLessons: LessonSummary[];
}) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    void loadRemoteProgress();
    return subscribeToProgress(() => setVersion((value) => value + 1));
  }, []);

  const lessons = mergeLessonsWithStoredProgress(initialLessons);
  const summary = {
    levels: mergeLevelsWithStoredProgress(initialLevels, lessons),
    completedLessons: lessons.filter((lesson) => lesson.status === "completed").length,
    availableLessons: lessons.filter((lesson) => lesson.status === "available").length,
    inProgressLessons: lessons.filter((lesson) => lesson.status === "in_progress").length,
    lockedLessons: lessons.filter((lesson) => lesson.status === "locked").length,
    overallProgress: Math.round(lessons.reduce((sum, lesson) => sum + lesson.progress, 0) / lessons.length)
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm font-semibold text-brand-accent">Completed</p>
          <p className="mt-2 text-3xl font-bold text-brand-text">{summary.completedLessons}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-brand-accent">In progress</p>
          <p className="mt-2 text-3xl font-bold text-brand-text">{summary.inProgressLessons}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-brand-accent">Available</p>
          <p className="mt-2 text-3xl font-bold text-brand-text">{summary.availableLessons}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-brand-accent">Locked</p>
          <p className="mt-2 text-3xl font-bold text-brand-text">{summary.lockedLessons}</p>
        </Card>
      </div>

      <Card>
        <ProgressBar value={summary.overallProgress} label="Overall A0/A1 progress" />
      </Card>

      <div className="grid gap-4">
        {summary.levels.map((level) => (
          <Card key={level.code} className="grid gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-brand-text">{level.title}</h2>
                <p className="text-sm text-brand-muted">{level.lessonCount} lessons</p>
              </div>
              <span className="text-sm font-semibold text-brand-muted">
                {level.status === "available" ? "Active" : "Future"}
              </span>
            </div>
            <ProgressBar value={level.progress} label="Level progress" />
          </Card>
        ))}
      </div>
    </>
  );
}
