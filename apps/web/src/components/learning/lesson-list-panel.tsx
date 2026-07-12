"use client";

import { useEffect, useState } from "react";
import type { LessonSummary } from "@nederstart/shared";
import {
  loadRemoteProgress,
  mergeLessonsWithStoredProgress,
  subscribeToProgress
} from "@/lib/learning/progress-store";
import { LessonCard } from "@/components/lesson/lesson-card";

export function LessonListPanel({ lessons }: { lessons: LessonSummary[] }) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    void loadRemoteProgress();
    return subscribeToProgress(() => setVersion((value) => value + 1));
  }, []);

  return (
    <div className="grid gap-4">
      {mergeLessonsWithStoredProgress(lessons).map((lesson) => (
        <LessonCard key={lesson.code} lesson={lesson} />
      ))}
    </div>
  );
}
