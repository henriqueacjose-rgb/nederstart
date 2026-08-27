'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { VocabItem } from '@/lib/lesson';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AudioButton } from './audio-button';
import { cn } from '@/lib/utils';
import { ChevronDown, Lightbulb } from 'lucide-react';

export function VocabCard({ vocab }: { vocab: VocabItem }) {
  const t = useTranslations('lesson');
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-2xl font-bold tracking-tight">
              {vocab.dutchWord}
            </span>
            {vocab.gender && (
              <Badge variant="secondary" className="text-xs">
                {vocab.gender}
              </Badge>
            )}
            {vocab.wordType && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {vocab.wordType}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-lg text-muted-foreground">
            {vocab.translation}
          </p>
        </div>
        <AudioButton text={vocab.dutchWord} compact />
      </div>

      {vocab.exampleSentence && (
        <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-sm italic">
          “{vocab.exampleSentence}”
        </p>
      )}

      {vocab.pronunciationHint && (
        <div className="mt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground"
            onClick={() => setShowHint((s) => !s)}
          >
            <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
            {showHint ? t('hideHint') : t('showHint')}
            <ChevronDown
              className={cn(
                'ml-1 h-3.5 w-3.5 transition-transform',
                showHint && 'rotate-180'
              )}
            />
          </Button>
          {showHint && (
            <div className="mt-2 rounded-lg border border-accent/30 bg-accent/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {t('pronunciationHint')}
              </p>
              <p className="mt-1 font-mono text-sm">{vocab.pronunciationHint}</p>
              <p className="mt-2 text-xs italic text-muted-foreground">
                {t('pronunciationDisclaimer')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
