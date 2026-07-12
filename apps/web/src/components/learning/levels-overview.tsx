"use client";

import { useEffect, useState } from "react";
import type { LessonSummary, LevelSummary } from "@nederstart/shared";
import {
  loadRemoteProgress,
  mergeLevelsWithStoredProgress,
  mergeLessonsWithStoredProgress,
  subscribeToProgress
} from "@/lib/learning/progress-store";
import { LevelCard } from "@/components/levels/level-card";

export function LevelsOverview({ levels, lessons }: { levels: LevelSummary[]; lessons: LessonSummary[] }) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    void loadRemoteProgress();
    return subscribeToProgress(() => setVersion((value) => value + 1));
  }, []);

  const mergedLessons = mergeLessonsWithStoredProgress(lessons);
  const mergedLevels = mergeLevelsWithStoredProgress(levels, mergedLessons);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {mergedLevels.map((level) => (
        <LevelCard key={level.code} level={level} />
      ))}
    </div>
  );
}
