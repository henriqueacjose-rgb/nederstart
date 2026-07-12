"use client";

import type { LessonStatus, LessonSummary, LevelSummary } from "@nederstart/shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type LessonProgressState = {
  audioCompleted: boolean;
  shadowingCompleted: boolean;
  exercisesCompleted: boolean;
  quizCompleted: boolean;
  flashcardsCompleted: boolean;
  lessonCompleted: boolean;
  updatedAt: string;
};

export type ProgressStore = Record<string, LessonProgressState>;

const CHANGE_EVENT = "nederstart-progress-change";

const emptyProgress: LessonProgressState = {
  audioCompleted: false,
  shadowingCompleted: false,
  exercisesCompleted: false,
  quizCompleted: false,
  flashcardsCompleted: false,
  lessonCompleted: false,
  updatedAt: ""
};

let memoryStore: ProgressStore = {};
let lastLocalUpdateAt = 0;

function dispatchProgressChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function readProgressStore(): ProgressStore {
  return memoryStore;
}

export function readLessonProgress(lessonCode: string): LessonProgressState {
  return memoryStore[lessonCode] ?? emptyProgress;
}

export function calculateProgressPercent(progress: LessonProgressState): number {
  if (progress.lessonCompleted) return 100;
  const parts = [
    progress.audioCompleted,
    progress.shadowingCompleted,
    progress.exercisesCompleted,
    progress.quizCompleted,
    progress.flashcardsCompleted
  ];
  return Math.round((parts.filter(Boolean).length / parts.length) * 100);
}

export function statusFromProgress(progress: LessonProgressState, fallback: LessonStatus): LessonStatus {
  if (progress.lessonCompleted) return "completed";
  if (calculateProgressPercent(progress) > 0) return "in_progress";
  return fallback;
}

function fromRow(row: Record<string, unknown>): LessonProgressState {
  return {
    audioCompleted: Boolean(row.audio_completed_at),
    shadowingCompleted: Boolean(row.shadowing_completed_at),
    exercisesCompleted: Boolean(row.exercises_completed_at),
    quizCompleted: Boolean(row.quiz_completed_at),
    flashcardsCompleted: Boolean(row.flashcards_completed_at),
    lessonCompleted: row.status === "completed" || Boolean(row.completed_at),
    updatedAt: String(row.updated_at ?? "")
  };
}

function completionPatch(progress: LessonProgressState) {
  const completed =
    progress.audioCompleted &&
    progress.shadowingCompleted &&
    progress.exercisesCompleted &&
    progress.quizCompleted &&
    progress.flashcardsCompleted;
  return {
    status: completed || progress.lessonCompleted ? "completed" : calculateProgressPercent(progress) > 0 ? "in_progress" : "available",
    audio_completed_at: progress.audioCompleted ? new Date().toISOString() : null,
    shadowing_completed_at: progress.shadowingCompleted ? new Date().toISOString() : null,
    exercises_completed_at: progress.exercisesCompleted ? new Date().toISOString() : null,
    quiz_completed_at: progress.quizCompleted ? new Date().toISOString() : null,
    flashcards_completed_at: progress.flashcardsCompleted ? new Date().toISOString() : null,
    completed_at: completed || progress.lessonCompleted ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };
}

export async function loadRemoteProgress() {
  const loadStartedAt = Date.now();
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    dispatchProgressChange();
    return memoryStore;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    memoryStore = {};
    dispatchProgressChange();
    return memoryStore;
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("status,audio_completed_at,shadowing_completed_at,exercises_completed_at,quiz_completed_at,flashcards_completed_at,completed_at,updated_at,lessons(code)")
    .eq("user_id", user.id);

  if (!error && data) {
    const remoteStore = Object.fromEntries(
      data
        .map((row) => {
          const lesson = row.lessons as { code?: string } | null;
          return lesson?.code ? [lesson.code, fromRow(row)] : null;
        })
        .filter(Boolean) as Array<[string, LessonProgressState]>
    );
    memoryStore = loadStartedAt >= lastLocalUpdateAt ? remoteStore : { ...remoteStore, ...memoryStore };
  }

  dispatchProgressChange();
  return memoryStore;
}

export async function updateLessonProgress(
  lessonCode: string,
  patch: Partial<Omit<LessonProgressState, "updatedAt">>
) {
  const current = memoryStore[lessonCode] ?? emptyProgress;
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  };
  const autoComplete =
    next.audioCompleted &&
    next.shadowingCompleted &&
    next.exercisesCompleted &&
    next.quizCompleted &&
    next.flashcardsCompleted;
  memoryStore = {
    ...memoryStore,
    [lessonCode]: { ...next, lessonCompleted: next.lessonCompleted || autoComplete }
  };
  lastLocalUpdateAt = Date.now();
  dispatchProgressChange();

  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: lesson, error: lessonError } = await supabase.from("lessons").select("id").eq("code", lessonCode).maybeSingle();
  if (lessonError || !lesson?.id) return;

  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lesson.id,
      ...completionPatch(memoryStore[lessonCode])
    },
    { onConflict: "user_id,lesson_id" }
  );

  await supabase.from("progress_events").insert({
    user_id: user.id,
    lesson_id: lesson.id,
    event_type: "lesson_progress_updated",
    event_payload: patch
  });
}

export async function saveQuizAttempt(lessonCode: string, score: number, answers: Record<string, string>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("lessons")
    .select("id, quizzes(id)")
    .eq("code", lessonCode)
    .maybeSingle();
  const quiz = (data?.quizzes as Array<{ id: string }> | undefined)?.[0];
  if (error || !data?.id || !quiz?.id) return;

  await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    lesson_id: data.id,
    quiz_id: quiz.id,
    score,
    answers_json: answers,
    completed_at: new Date().toISOString()
  });
}

export function subscribeToProgress(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

export function mergeLessonsWithStoredProgress(lessons: LessonSummary[]) {
  return lessons.map((lesson) => {
    const progress = readLessonProgress(lesson.code);
    const storedPercent = calculateProgressPercent(progress);
    return {
      ...lesson,
      progress: Math.max(lesson.progress, storedPercent),
      status: statusFromProgress(progress, lesson.status)
    };
  });
}

export function mergeLevelsWithStoredProgress(levels: LevelSummary[], lessons: LessonSummary[]) {
  const mergedLessons = mergeLessonsWithStoredProgress(lessons);
  return levels.map((level) => {
    const levelLessons = mergedLessons.filter((lesson) => lesson.levelCode === level.code);
    if (levelLessons.length === 0) return level;
    const progress = Math.round(
      levelLessons.reduce((sum, lesson) => sum + lesson.progress, 0) / levelLessons.length
    );
    return { ...level, progress };
  });
}
