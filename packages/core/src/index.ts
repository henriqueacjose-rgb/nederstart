export const LESSON_COMPLETION_RULES = {
  audioCompleted: true,
  shadowingCompleted: false,
  exercisesCompleted: false,
  quizCompleted: false
} as const;

export const SUPPORTED_BASE_LANGUAGES = [
  { code: "pt", label: "Portuguese" },
  { code: "en", label: "English" }
] as const;
