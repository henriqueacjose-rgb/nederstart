import { prisma } from '@/lib/prisma';

export interface AdminStats {
  totalUsers: number;
  publishedLessons: number;
  totalVocab: number;
  totalExercises: number;
  completions: number;
}

export interface AdminLesson {
  id: number;
  lessonCode: string;
  title: string;
  isPublished: boolean;
  isFree: boolean;
}

export interface AdminModule {
  id: number;
  title: string;
  sortOrder: number;
  isPublished: boolean;
  lessons: AdminLesson[];
}

export interface AdminLevel {
  id: number;
  code: string;
  title: string;
  isPublished: boolean;
  modules: AdminModule[];
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  plan: string;
  createdAt: string;
}

type LocalizedTitle = {
  locale: string;
  title?: string | null;
};

function pick(
  arr: LocalizedTitle[],
  locale: string
): LocalizedTitle | undefined {
  return (
    arr.find((x) => x.locale === locale) ??
    arr.find((x) => x.locale === 'en') ??
    arr[0]
  );
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    totalUsers,
    publishedLessons,
    totalVocab,
    totalExercises,
    completions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lesson.count({
      where: {
        isPublished: true,
      },
    }),
    prisma.vocabulary.count(),
    prisma.exercise.count(),
    prisma.lessonProgress.count({
      where: {
        status: 'completed',
      },
    }),
  ]);

  return {
    totalUsers,
    publishedLessons,
    totalVocab,
    totalExercises,
    completions,
  };
}

export async function getContentTree(
  locale: string
): Promise<AdminLevel[]> {
  const levels = await prisma.level.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
    include: {
      translations: true,
      modules: {
        orderBy: {
          sortOrder: 'asc',
        },
        include: {
          translations: true,
          lessons: {
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

  return levels.map((lvl: any) => ({
    id: lvl.id,
    code: lvl.code,
    title:
      pick(lvl.translations as LocalizedTitle[], locale)?.title ??
      lvl.code,
    isPublished: lvl.isPublished,
    modules: lvl.modules.map((m: any) => ({
      id: m.id,
      title:
        pick(m.translations as LocalizedTitle[], locale)?.title ??
        `Module ${m.sortOrder}`,
      sortOrder: m.sortOrder,
      isPublished: m.isPublished,
      lessons: m.lessons.map((l: any) => ({
        id: l.id,
        lessonCode: l.lessonCode,
        title:
          pick(l.translations as LocalizedTitle[], locale)?.title ??
          l.lessonCode,
        isPublished: l.isPublished,
        isFree: l.isFree,
      })),
    })),
  }));
}

export async function getAdminUsers(
  limit = 100
): Promise<AdminUser[]> {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      plan: true,
      createdAt: true,
    },
  });

  return users.map((u: any) => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    plan: u.plan,
    createdAt: u.createdAt.toISOString(),
  }));
}