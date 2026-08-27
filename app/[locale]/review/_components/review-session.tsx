'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ReviewWord } from '@/lib/review';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AudioButton } from '../../lessons/[code]/_components/audio-button';
import {
  Check,
  X,
  RotateCcw,
  PartyPopper,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

export function ReviewSession({
  locale,
  words,
}: {
  locale: string;
  words: ReviewWord[];
}) {
  const t = useTranslations('review');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [done, setDone] = useState(words.length === 0);

  const current = words[index];
  const total = words.length;

  const record = async (correct: boolean) => {
    if (!current) return;
    fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vocabularyId: current.vocabularyId, correct }),
    }).catch(() => {});
    setReviewed((r) => r + 1);
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setRevealed(false);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <PartyPopper className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
          {total === 0 ? t('title') : t('sessionComplete')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {total === 0 ? t('noWords') : t('reviewedWords', { count: reviewed })}
        </p>
        <div className="mt-8 flex w-full flex-col gap-2">
          <Link href={`/${locale}/dashboard`} className="w-full">
            <Button className="w-full" size="lg">
              {t('title')}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('wordsToReview', { count: total })}
        </p>
        <Progress value={(index / total) * 100} className="mt-3 h-2" />
      </div>

      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="font-display text-4xl font-bold tracking-tight">
            {current.dutchWord}
          </span>
          <AudioButton text={current.dutchWord} compact />
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          {current.gender && (
            <Badge variant="secondary" className="text-xs">
              {current.gender}
            </Badge>
          )}
          {current.wordType && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {current.wordType}
            </Badge>
          )}
        </div>

        {revealed ? (
          <div className="mt-6">
            <p className="text-2xl font-medium text-primary">
              {current.translation}
            </p>
            {current.exampleSentence && (
              <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-sm italic">
                “{current.exampleSentence}”
              </p>
            )}
            {current.pronunciationHint && (
              <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-sm text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-accent" />
                {current.pronunciationHint}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <Button variant="outline" onClick={() => setRevealed(true)}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              {t('showAnswer')}
            </Button>
          </div>
        )}
      </div>

      {revealed && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="border-destructive/40 text-destructive hover:bg-destructive/5"
            onClick={() => record(false)}
          >
            <X className="mr-1.5 h-4 w-4" />
            {t('missed')}
          </Button>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => record(true)}
          >
            <Check className="mr-1.5 h-4 w-4" />
            {t('gotIt')}
          </Button>
        </div>
      )}
    </div>
  );
}
