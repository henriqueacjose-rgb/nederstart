import { prisma } from '@/lib/prisma';

export interface VocabItem {
  id: number;
  dutchWord: string;
  wordType: string | null;
  gender: string | null;
  translation: string;
  pronunciationHint: string | null;
  exampleSentence: string | null;
}

export interface ExerciseOptionItem {
  id: number;
  sortOrder: number;
  optionText: string;
  isCorrect: boolean;
}

export interface ExerciseItem {
  id: number;
  exerciseType: string;
  question: string;
  instruction: string | null;
  explanation: string | null;
  options: ExerciseOptionItem[];
}

export interface LessonSectionData {
  id: number;
  sortOrder: number;
  sectionType: string;
  content: any;
  vocab?: VocabItem[];
  exercises?: ExerciseItem[];
}

export interface LessonData {
  id: number;
  lessonCode: string;
  title: string;
  description: string | null;
  learningObjectives: string[];
  xpReward: number;
  estimatedMinutes: number;
  isFree: boolean;
  levelCode: string;
  sections: LessonSectionData[];
  vocab: VocabItem[];
  status:
    | 'not_started'
    | 'in_progress'
    | 'completed';
  locked: boolean;
  nextLessonCode: string | null;
}

type TranslationLike = {
  locale: string;

  title?: string | null;
  description?: string | null;
  learningObjectives?: string[] | null;

  translation?: string | null;
  pronunciationHint?: string | null;
  exampleSentence?: string | null;

  question?: string | null;
  instruction?: string | null;
  explanation?: string | null;
};

function pick(
  arr: TranslationLike[],
  locale: string
): TranslationLike | undefined {
  return (
    arr.find(
      (x: TranslationLike) =>
        x.locale === locale
    ) ??
    arr.find(
      (x: TranslationLike) =>
        x.locale === 'en'
    ) ??
    arr[0]
  );
}

export async function getLessonByCode(
  code: string,
  locale: string,
  userId?: string | null
): Promise<LessonData | null> {
  const lesson = await prisma.lesson.findUnique({
    where: {
      lessonCode: code,
    },
    include: {
      translations: true,

      sections: {
        orderBy: {
          sortOrder: 'asc',
        },
      },

      module: {
        include: {
          level: true,
        },
      },

      lessonVocabulary: {
        include: {
          vocabulary: {
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });

  if (!lesson || !lesson.isPublished) {
    return null;
  }

  const lessonT = pick(
    (lesson as any)
      .translations as TranslationLike[],
    locale
  );

  const vocab: VocabItem[] = (
    (lesson as any).lessonVocabulary as any[]
  ).map((lv: any) => {
    const vt = pick(
      lv.vocabulary
        .translations as TranslationLike[],
      locale
    );

    return {
      id: lv.vocabulary.id,
      dutchWord: lv.vocabulary.dutchWord,
      wordType: lv.vocabulary.wordType,
      gender: lv.vocabulary.gender,
      translation:
        vt?.translation ?? '',
      pronunciationHint:
        vt?.pronunciationHint ?? null,
      exampleSentence:
        vt?.exampleSentence ?? null,
    };
  });

  const vocabById = new Map<number, VocabItem>(
    vocab.map((v: VocabItem) => [
      v.id,
      v,
    ])
  );

  const allExerciseIds = (
    (lesson as any).sections as any[]
  ).flatMap((section: any) => {
    const content = section.content as any;

    return (
      section.sectionType === 'quiz' &&
      Array.isArray(content?.exerciseIds)
    )
      ? (content.exerciseIds as number[])
      : [];
  });

  const exercisesRaw =
    allExerciseIds.length > 0
      ? await prisma.exercise.findMany({
          where: {
            id: {
              in: allExerciseIds,
            },
          },
          include: {
            translations: true,
            options: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        })
      : [];

  const exerciseById =
    new Map<number, ExerciseItem>(
      (exercisesRaw as any[]).map(
        (exercise: any) => {
          const et = pick(
            exercise
              .translations as TranslationLike[],
            locale
          );

          const item: ExerciseItem = {
            id: exercise.id,
            exerciseType:
              exercise.exerciseType,
            question:
              et?.question ?? '',
            instruction:
              et?.instruction ?? null,
            explanation:
              et?.explanation ?? null,

            options: (
              exercise.options as any[]
            ).map((option: any) => ({
              id: option.id,
              sortOrder:
                option.sortOrder,
              optionText:
                option.optionText,
              isCorrect:
                option.isCorrect,
            })),
          };

          return [
            exercise.id,
            item,
          ] as [number, ExerciseItem];
        }
      )
    );

  const sections: LessonSectionData[] = (
    (lesson as any).sections as any[]
  ).map((section: any) => {
    const content =
      section.content as any;

    const data: LessonSectionData = {
      id: section.id,
      sortOrder: section.sortOrder,
      sectionType:
        section.sectionType,
      content,
    };

    if (section.sectionType === 'vocab') {
      const ids: number[] =
        Array.isArray(
          content?.vocabularyIds
        )
          ? content.vocabularyIds
          : [];

      data.vocab = ids
        .map((id: number) =>
          vocabById.get(id)
        )
        .filter(
          (
            item:
              | VocabItem
              | undefined
          ): item is VocabItem =>
            Boolean(item)
        );

      if (data.vocab.length === 0) {
        data.vocab = vocab;
      }
    }

    if (section.sectionType === 'quiz') {
      const ids: number[] =
        Array.isArray(
          content?.exerciseIds
        )
          ? content.exerciseIds
          : [];

      data.exercises = ids
        .map((id: number) =>
          exerciseById.get(id)
        )
        .filter(
          (
            item:
              | ExerciseItem
              | undefined
          ): item is ExerciseItem =>
            Boolean(item)
        );
    }

    return data;
  });

  let status:
    | 'not_started'
    | 'in_progress'
    | 'completed' =
    'not_started';

  let locked = false;

  if (userId) {
    const prog =
      await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId:
              (lesson as any).id,
          },
        },
      });

    status = (
      prog?.status ??
      'not_started'
    ) as typeof status;
  }

  const levelLessons =
    await prisma.lesson.findMany({
      where: {
        isPublished: true,
        module: {
          levelId:
            (lesson as any)
              .module.levelId,
          isPublished: true,
        },
      },
      include: {
        module: true,
      },
    });

  const ordered = (
    levelLessons as any[]
  ).sort((a: any, b: any) => {
    if (
      a.module.sortOrder !==
      b.module.sortOrder
    ) {
      return (
        a.module.sortOrder -
        b.module.sortOrder
      );
    }

    return (
      a.sortOrder -
      b.sortOrder
    );
  });

  const idx = ordered.findIndex(
    (item: any) =>
      item.id ===
      (lesson as any).id
  );

  const prevLesson =
    idx > 0
      ? ordered[idx - 1]
      : null;

  const nextLesson =
    idx >= 0 &&
    idx < ordered.length - 1
      ? ordered[idx + 1]
      : null;

  if (userId && prevLesson) {
    const prevProg =
      await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId:
              prevLesson.id,
          },
        },
      });

    locked =
      prevProg?.status !==
      'completed';
  } else if (
    !userId &&
    prevLesson
  ) {
    locked = true;
  }

  return {
    id: (lesson as any).id,

    lessonCode:
      (lesson as any)
        .lessonCode,

    title:
      lessonT?.title ??
      (lesson as any)
        .lessonCode,

    description:
      lessonT?.description ??
      null,

    learningObjectives:
      lessonT
        ?.learningObjectives ??
      [],

    xpReward:
      (lesson as any)
        .xpReward,

    estimatedMinutes:
      (lesson as any)
        .estimatedMinutes,

    isFree:
      (lesson as any)
        .isFree,

    levelCode:
      (lesson as any)
        .module.level.code,

    sections,

    vocab,

    status,

    locked,

    nextLessonCode:
      nextLesson?.lessonCode ??
      null,
  };
}