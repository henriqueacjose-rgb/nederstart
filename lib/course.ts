import { prisma } from '@/lib/prisma';

export interface LessonNodeData {
  id: number;
  lessonCode: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isFree: boolean;
  xpReward: number;
  estimatedMinutes: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  locked: boolean;
}

export interface ModuleNodeData {
  id: number;
  sortOrder: number;
  title: string;
  description: string | null;
  lessons: LessonNodeData[];
}

export interface LevelNodeData {
  id: number;
  code: string;
  sortOrder: number;
  isPublished: boolean;
  xpRequired: number;
  title: string;
  description: string | null;
  modules: ModuleNodeData[];
  totalLessons: number;
  completedLessons: number;
}

type TranslationLike = {
  locale: string;
  title?: string | null;
  description?: string | null;
};

function pickTranslation(
  translations: TranslationLike[],
  locale: string
): TranslationLike | undefined {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === 'en') ??
    translations[0]
  );
}

export async function getCourseMap(
  locale: string,
  userId?: string | null
): Promise<LevelNodeData[]> {
  const levels = await prisma.level.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
    include: {
      translations: true,
      modules: {
        where: {
          isPublished: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
        include: {
          translations: true,
          lessons: {
            where: {
              isPublished: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });

  let progressMap = new Map<
    number,
    {
      status: string;
      score: number | null;
    }
  >();

  if (userId) {
    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId,
      },
    });

    progressMap = new Map(
      progress.map((p: any) => [
        p.lessonId,
        {
          status: p.status,
          score: p.score,
        },
      ])
    );
  }

  return levels.map((level: any) => {
    const levelT = pickTranslation(
      level.translations as TranslationLike[],
      locale
    );

    const orderedLessons = level.modules.flatMap(
      (m: any) => m.lessons
    );

    let previousCompleted = true;

    const lockState = new Map<number, boolean>();

    for (const lesson of orderedLessons) {
      const prog = progressMap.get(lesson.id);
      const locked = !previousCompleted;

      lockState.set(lesson.id, locked);

      previousCompleted = prog?.status === 'completed';
    }

    let completedLessons = 0;

    const modules: ModuleNodeData[] = level.modules.map(
      (m: any) => {
        const moduleT = pickTranslation(
          m.translations as TranslationLike[],
          locale
        );

        const lessons: LessonNodeData[] = m.lessons.map(
          (lesson: any) => {
            const lessonT = pickTranslation(
              lesson.translations as TranslationLike[],
              locale
            );

            const prog = progressMap.get(lesson.id);

            const status = (
              prog?.status ?? 'not_started'
            ) as
              | 'not_started'
              | 'in_progress'
              | 'completed';

            if (status === 'completed') {
              completedLessons += 1;
            }

            return {
              id: lesson.id,
              lessonCode: lesson.lessonCode,
              title:
                lessonT?.title ??
                lesson.lessonCode,
              description:
                lessonT?.description ??
                null,
              sortOrder: lesson.sortOrder,
              isFree: lesson.isFree,
              xpReward: lesson.xpReward,
              estimatedMinutes:
                lesson.estimatedMinutes,
              status,
              score:
                prog?.score ??
                null,
              locked: level.isPublished
                ? lockState.get(lesson.id) ?? false
                : true,
            };
          }
        );

        return {
          id: m.id,
          sortOrder: m.sortOrder,
          title:
            moduleT?.title ??
            '',
          description:
            moduleT?.description ??
            null,
          lessons,
        };
      }
    );

    const totalLessons = orderedLessons.length;

    return {
      id: level.id,
      code: level.code,
      sortOrder: level.sortOrder,
      isPublished: level.isPublished,
      xpRequired: level.xpRequired,
      title:
        levelT?.title ??
        level.code,
      description:
        levelT?.description ??
        null,
      modules,
      totalLessons,
      completedLessons,
    };
  });
}