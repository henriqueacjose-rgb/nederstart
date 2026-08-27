import { prisma } from '@/lib/prisma';

export interface ReviewWord {
  vocabularyId: number;
  dutchWord: string;
  wordType: string | null;
  gender: string | null;
  translation: string;
  pronunciationHint: string | null;
  exampleSentence: string | null;
}

type VocabularyTranslation = {
  locale: string;
  translation?: string | null;
  pronunciationHint?: string | null;
  exampleSentence?: string | null;
};

export async function getReviewWords(
  userId: string,
  locale: string,
  limit = 20
): Promise<ReviewWord[]> {
  const due =
    await prisma.vocabularyProgress.findMany({
      where: {
        userId,

        status: {
          in: [
            'learning',
            'new',
          ],
        },

        OR: [
          {
            nextReview: {
              lte: new Date(),
            },
          },
          {
            nextReview: null,
          },
        ],
      },

      orderBy: {
        nextReview: 'asc',
      },

      take: limit,

      include: {
        vocabulary: {
          include: {
            translations: true,
          },
        },
      },
    });

  return (due as any[]).map(
    (progress: any) => {
      const translations =
        progress.vocabulary
          .translations as VocabularyTranslation[];

      const t =
        translations.find(
          (
            item:
              VocabularyTranslation
          ) =>
            item.locale ===
            locale
        ) ??
        translations.find(
          (
            item:
              VocabularyTranslation
          ) =>
            item.locale ===
            'en'
        ) ??
        translations[0];

      return {
        vocabularyId:
          progress.vocabularyId,

        dutchWord:
          progress.vocabulary
            .dutchWord,

        wordType:
          progress.vocabulary
            .wordType,

        gender:
          progress.vocabulary
            .gender,

        translation:
          t?.translation ?? '',

        pronunciationHint:
          t?.pronunciationHint ??
          null,

        exampleSentence:
          t?.exampleSentence ??
          null,
      };
    }
  );
}

// Spaced-repetition intervals (days)
// keyed by consecutive correct count.
const INTERVALS = [
  1,
  2,
  4,
  7,
  14,
  30,
];

export function computeNextReview(
  correctCount: number,
  correct: boolean
): {
  nextReviewMs: number;
  status: string;
} {
  if (!correct) {
    return {
      nextReviewMs:
        24 * 60 * 60 * 1000,
      status: 'learning',
    };
  }

  const idx = Math.min(
    correctCount,
    INTERVALS.length - 1
  );

  const days =
    INTERVALS[idx];

  const status =
    correctCount + 1 >= 5
      ? 'mastered'
      : 'learning';

  return {
    nextReviewMs:
      days *
      24 *
      60 *
      60 *
      1000,

    status,
  };
}