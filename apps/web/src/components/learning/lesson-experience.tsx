"use client";

import { useEffect, useState } from "react";
import type { LessonDetail } from "@nederstart/shared";
import {
  calculateProgressPercent,
  loadRemoteProgress,
  readLessonProgress,
  subscribeToProgress,
  updateLessonProgress
} from "@/lib/learning/progress-store";
import { AudioPlayer } from "@/components/learning/audio-player";
import { FlashcardDeck } from "@/components/learning/flashcard-deck";
import { InteractiveExercises } from "@/components/learning/interactive-exercises";
import { InteractiveQuiz } from "@/components/learning/interactive-quiz";
import { ShadowingFlow } from "@/components/learning/shadowing-flow";
import { ProgressBar } from "@/components/progress/progress-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LessonExperience({ lesson }: { lesson: LessonDetail }) {
  const [hydrated, setHydrated] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setHydrated(true);
    void loadRemoteProgress();
    return subscribeToProgress(() => setRefresh((value) => value + 1));
  }, []);

  const storedProgress = hydrated ? readLessonProgress(lesson.code) : undefined;
  const progress = storedProgress ? Math.max(lesson.progress, calculateProgressPercent(storedProgress)) : lesson.progress;
  const complete = storedProgress?.lessonCompleted ?? lesson.status === "completed";

  function completeLesson() {
    updateLessonProgress(lesson.code, {
      audioCompleted: true,
      shadowingCompleted: true,
      exercisesCompleted: true,
      quizCompleted: true,
      flashcardsCompleted: true,
      lessonCompleted: true
    });
    setRefresh((value) => value + 1);
  }

  return (
    <div className="grid gap-4" data-refresh={refresh}>
      <Card className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-accent">Interactive lesson progress</p>
            <h2 className="mt-1 text-xl font-bold text-brand-text">{complete ? "Lesson complete" : "Keep going"}</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complete ? "bg-[#E3F3EC] text-brand-success" : "bg-[#FFF3E8] text-brand-warning"}`}>
            {complete ? "Completed" : "In progress"}
          </span>
        </div>
        <ProgressBar value={progress} label="Interactive progress" />
        {!hydrated ? <p className="text-sm text-brand-muted">Loading saved progress...</p> : null}
      </Card>

      <AudioPlayer lessonCode={lesson.code} items={lesson.audioPlaceholders} />
      <ShadowingFlow lessonCode={lesson.code} phrases={lesson.phrases} />
      <InteractiveExercises
        lessonCode={lesson.code}
        vocabulary={lesson.vocabulary}
        phrases={lesson.phrases}
        exercises={lesson.exercises}
      />
      <InteractiveQuiz
        lessonCode={lesson.code}
        questions={lesson.quizQuestions}
        vocabulary={lesson.vocabulary}
        phrases={lesson.phrases}
      />
      <FlashcardDeck lessonCode={lesson.code} flashcards={lesson.flashcards} />

      <Card className="grid gap-3">
        <h2 className="text-xl font-bold text-brand-text">Lesson completion</h2>
        <p className="text-sm text-brand-muted">
          Complete all interactive sections or use this button during QA to mark the lesson as finished.
        </p>
        {complete ? (
          <p className="rounded-component bg-[#E3F3EC] p-3 text-sm font-semibold text-brand-success">
            Success state saved for this lesson.
          </p>
        ) : null}
        <Button type="button" onClick={completeLesson}>
          Mark lesson complete
        </Button>
      </Card>
    </div>
  );
}
