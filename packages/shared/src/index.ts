export type BaseLanguageCode = "pt" | "en";
export type LessonStatus = "locked" | "available" | "in_progress" | "completed";

export type LevelSummary = {
  code: "A0" | "A1" | "A2" | "B1" | "B2";
  title: string;
  description: string;
  lessonCount: number;
  progress: number;
  status: "available" | "coming_soon";
};

export type LessonSummary = {
  code: string;
  levelCode: string;
  title: string;
  objective: string;
  order: number;
  status: LessonStatus;
  progress: number;
};

export type ContentBlock = {
  id: string;
  lessonCode: string;
  type: string;
  title: string;
  order: number;
  body: string;
};

export type VocabularyItem = {
  id: string;
  lessonCode: string;
  textNl: string;
  translationPt: string;
  translationEn: string;
  audioPath?: string;
  explanation?: string;
  example?: string;
  order: number;
};

export type PhraseItem = {
  id: string;
  lessonCode: string;
  textNl: string;
  translationPt: string;
  translationEn: string;
  audioPath?: string;
  soundBlocks?: string;
  slowForm?: string;
  naturalForm?: string;
  reducedForm?: string;
  explanation?: string;
  order: number;
};

export type AudioPlaceholder = {
  id: string;
  lessonCode: string;
  ownerId: string;
  type: "word" | "phrase" | "dialogue";
  speed: "slow" | "natural" | "reduced";
  transcriptNl: string;
  fileUrl: string;
  status: "placeholder" | "recorded" | "reviewed" | "published";
};

export type ExerciseItem = {
  id: string;
  lessonCode: string;
  type: string;
  prompt: string;
  order: number;
};

export type QuizQuestion = {
  id: string;
  lessonCode: string;
  prompt: string;
  order: number;
};

export type FlashcardItem = {
  id: string;
  lessonCode: string;
  front: string;
  back: string;
  audioPath?: string;
  order: number;
};

export type RoleplayItem = {
  id: string;
  lessonCode: string;
  title: string;
  scenario: string;
  order: number;
};

export type LessonDetail = LessonSummary & {
  markdown: string;
  contentBlocks: ContentBlock[];
  vocabulary: VocabularyItem[];
  phrases: PhraseItem[];
  audioPlaceholders: AudioPlaceholder[];
  exercises: ExerciseItem[];
  quizQuestions: QuizQuestion[];
  flashcards: FlashcardItem[];
  roleplays: RoleplayItem[];
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  baseLanguage: BaseLanguageCode;
  currentLevel: string;
};
