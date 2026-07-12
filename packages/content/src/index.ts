import content from "../generated/nederstart-content.json";
import type { LessonDetail, LessonStatus, LessonSummary, LevelSummary } from "@nederstart/shared";

type GeneratedLevel = Omit<LevelSummary, "progress" | "status"> & {
  status: LevelSummary["status"];
};

type GeneratedLesson = Omit<LessonDetail, "status" | "progress"> & {
  estimatedMinutes: number;
  sourceFile: string;
};

export type DashboardSummary = {
  nextLesson: LessonSummary;
  currentLevel: LevelSummary;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
};

export type ProgressSummary = {
  levels: LevelSummary[];
  lessons: LessonSummary[];
  completedLessons: number;
  availableLessons: number;
  inProgressLessons: number;
  lockedLessons: number;
  overallProgress: number;
};

export type LessonSearchEntry = {
  code: string;
  levelCode: string;
  title: string;
  objective: string;
  vocabulary: Array<{
    id: string;
    lessonCode: string;
    lessonTitle: string;
    levelCode: string;
    textNl: string;
    translationPt: string;
    translationEn: string;
  }>;
};

const generatedLevels = content.levels as GeneratedLevel[];
const generatedLessons = content.lessons as GeneratedLesson[];

function lessonProgress(_code: string): { status: LessonStatus; progress: number } {
  return { status: "available", progress: 0 };
}

function toLessonSummary(lesson: GeneratedLesson): LessonSummary {
  const progress = lessonProgress(lesson.code);
  return {
    code: lesson.code,
    levelCode: lesson.levelCode,
    title: lesson.title,
    objective: lesson.objective,
    order: lesson.order,
    status: progress.status,
    progress: progress.progress
  };
}

function toLessonDetail(lesson: GeneratedLesson): LessonDetail {
  return {
    ...lesson,
    ...lessonProgress(lesson.code)
  };
}

function progressForLevel(levelCode: string): number {
  const levelLessons = generatedLessons.filter((lesson) => lesson.levelCode === levelCode);
  if (levelLessons.length === 0) return 0;
  const total = levelLessons.reduce((sum, lesson) => sum + lessonProgress(lesson.code).progress, 0);
  return Math.round(total / levelLessons.length);
}

function toLevelSummary(level: GeneratedLevel): LevelSummary {
  return {
    code: level.code,
    title: level.title,
    description: level.description,
    lessonCount: generatedLessons.filter((lesson) => lesson.levelCode === level.code).length,
    progress: progressForLevel(level.code),
    status: level.status
  };
}

export const course = content.course;
export const levels: LevelSummary[] = generatedLevels.map(toLevelSummary);
export const lessons: LessonSummary[] = generatedLessons.map(toLessonSummary);
export const lessonDetails: LessonDetail[] = generatedLessons.map(toLessonDetail);
export const lessonSearchIndex: LessonSearchEntry[] = generatedLessons.map((lesson) => ({
  code: lesson.code,
  levelCode: lesson.levelCode,
  title: lesson.title,
  objective: lesson.objective,
  vocabulary: lesson.vocabulary.map((item) => ({
    id: item.id,
    lessonCode: lesson.code,
    lessonTitle: lesson.title,
    levelCode: lesson.levelCode,
    textNl: item.textNl,
    translationPt: item.translationPt,
    translationEn: item.translationEn
  }))
}));

export function getLevelsWithProgress(): LevelSummary[] {
  return levels;
}

export function getLevelByCode(levelCode: string): LevelSummary | undefined {
  return levels.find((level) => level.code.toLowerCase() === levelCode.toLowerCase());
}

export function getLessonsByLevel(levelCode: string): LessonSummary[] {
  return lessons
    .filter((lesson) => lesson.levelCode.toLowerCase() === levelCode.toLowerCase())
    .sort((a, b) => a.order - b.order);
}

export function getLessonByCode(lessonCode: string): LessonDetail | undefined {
  return lessonDetails.find((lesson) => lesson.code.toLowerCase() === lessonCode.toLowerCase());
}

export function getDashboardSummary(): DashboardSummary {
  const nextLesson =
    lessons.find((lesson) => lesson.status === "in_progress") ??
    lessons.find((lesson) => lesson.status === "available") ??
    lessons[0];
  const currentLevel = getLevelByCode(nextLesson.levelCode) ?? levels[0];
  const completedLessons = lessons.filter((lesson) => lesson.status === "completed").length;
  const overallProgress = Math.round(
    lessons.reduce((sum, lesson) => sum + lesson.progress, 0) / lessons.length
  );

  return {
    nextLesson,
    currentLevel,
    totalLessons: lessons.length,
    completedLessons,
    overallProgress
  };
}

export function getProgressSummary(): ProgressSummary {
  const completedLessons = lessons.filter((lesson) => lesson.status === "completed").length;
  const availableLessons = lessons.filter((lesson) => lesson.status === "available").length;
  const inProgressLessons = lessons.filter((lesson) => lesson.status === "in_progress").length;
  const lockedLessons = lessons.filter((lesson) => lesson.status === "locked").length;
  const overallProgress = Math.round(
    lessons.reduce((sum, lesson) => sum + lesson.progress, 0) / lessons.length
  );

  return {
    levels,
    lessons,
    completedLessons,
    availableLessons,
    inProgressLessons,
    lockedLessons,
    overallProgress
  };
}
