'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ExerciseItem, ExerciseOptionItem } from '@/lib/lesson';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AudioButton } from './audio-button';
import {
  CheckCircle2,
  XCircle,
  Info,
  ArrowRight,
} from 'lucide-react';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function ExerciseRunner({
  exercises,
  onComplete,
}: {
  exercises: ExerciseItem[];
  onComplete: (scorePercent: number) => void;
}) {
  const t = useTranslations('exercise');
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const current = exercises[index];
  const total = exercises.length;

  // Answer state (reset per question via key on child inputs).
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [matchSelected, setMatchSelected] = useState<Record<number, string>>({});

  const resetAnswer = () => {
    setSelectedOptionId(null);
    setTextAnswer('');
    setOrderedIds([]);
    setMatchSelected({});
    setChecked(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  const evaluate = (): boolean => {
    switch (current.exerciseType) {
      case 'mcq':
      case 'true_false': {
        const opt = current.options.find((o) => o.id === selectedOptionId);
        return Boolean(opt?.isCorrect);
      }
      case 'fill_blank': {
        const answer = current.options.find((o) => o.isCorrect);
        return answer
          ? normalize(textAnswer) === normalize(answer.optionText)
          : false;
      }
      case 'word_order': {
        const correct = [...current.options]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((o) => o.id);
        return (
          orderedIds.length === correct.length &&
          orderedIds.every((id, i) => id === correct[i])
        );
      }
      case 'match_pairs': {
        return current.options.every((o) => {
          const [dutch, meaning] = o.optionText.split('|');
          return normalize(matchSelected[o.id] ?? '') === normalize(meaning ?? '');
        });
      }
      default:
        return false;
    }
  };

  const canCheck = (): boolean => {
    switch (current.exerciseType) {
      case 'mcq':
      case 'true_false':
        return selectedOptionId !== null;
      case 'fill_blank':
        return textAnswer.trim().length > 0;
      case 'word_order':
        return orderedIds.length === current.options.length;
      case 'match_pairs':
        return current.options.every((o) => matchSelected[o.id]);
      default:
        return false;
    }
  };

  const handleCheck = () => {
    const ok = evaluate();
    setIsCorrect(ok);
    setChecked(true);
    if (ok) setCorrectCount((c) => c + 1);
  };

  const handleContinue = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      resetAnswer();
    } else {
      const finalCorrect = correctCount;
      const percent = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
      onComplete(percent);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('question', { current: index + 1, total })}</span>
        </div>
        <Progress value={((index + (checked ? 1 : 0)) / total) * 100} className="h-1.5" />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        {current.instruction && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {current.instruction}
          </p>
        )}
        <h3 className="font-display text-xl font-bold tracking-tight">
          {current.question}
        </h3>

        <div className="mt-5">
          {(current.exerciseType === 'mcq' ||
            current.exerciseType === 'true_false') && (
            <McqOptions
              exercise={current}
              selectedId={selectedOptionId}
              checked={checked}
              onSelect={setSelectedOptionId}
              trueFalseLabels={{ true: t('true'), false: t('false') }}
            />
          )}

          {current.exerciseType === 'fill_blank' && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                {t('typeAnswer')}
              </p>
              <Input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={checked}
                className={cn(
                  'text-lg',
                  checked && isCorrect && 'border-green-500',
                  checked && !isCorrect && 'border-destructive'
                )}
              />
              {checked && !isCorrect && (
                <p className="mt-2 text-sm">
                  <span className="text-muted-foreground">→ </span>
                  <span className="font-medium text-green-600">
                    {current.options.find((o) => o.isCorrect)?.optionText}
                  </span>
                </p>
              )}
            </div>
          )}

          {current.exerciseType === 'word_order' && (
            <WordOrder
              exercise={current}
              orderedIds={orderedIds}
              checked={checked}
              onChange={setOrderedIds}
              tapHint={t('tapWords')}
            />
          )}

          {current.exerciseType === 'match_pairs' && (
            <MatchPairs
              exercise={current}
              selected={matchSelected}
              checked={checked}
              onChange={setMatchSelected}
              hint={t('matchPairs')}
            />
          )}
        </div>

        {checked && (
          <div
            className={cn(
              'mt-5 flex items-start gap-2 rounded-xl p-3 text-sm',
              isCorrect
                ? 'bg-green-500/10 text-green-700'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {isCorrect ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span className="font-medium">
              {isCorrect ? t('correct') : t('incorrect')}
            </span>
          </div>
        )}

        {checked && current.explanation && (
          <div className="mt-3">
            {!showExplanation ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setShowExplanation(true)}
              >
                <Info className="mr-1.5 h-3.5 w-3.5" />
                {t('showExplanation')}
              </Button>
            ) : (
              <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                {current.explanation}
              </p>
            )}
          </div>
        )}

        <div className="mt-6">
          {!checked ? (
            <Button
              type="button"
              className="w-full"
              disabled={!canCheck()}
              onClick={handleCheck}
            >
              {t('checkAnswer')}
            </Button>
          ) : (
            <Button type="button" className="w-full" onClick={handleContinue}>
              {t('continue')}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function McqOptions({
  exercise,
  selectedId,
  checked,
  onSelect,
  trueFalseLabels,
}: {
  exercise: ExerciseItem;
  selectedId: number | null;
  checked: boolean;
  onSelect: (id: number) => void;
  trueFalseLabels: { true: string; false: string };
}) {
  const label = (o: ExerciseOptionItem) => {
    if (exercise.exerciseType === 'true_false') {
      return o.optionText.toLowerCase() === 'true'
        ? trueFalseLabels.true
        : trueFalseLabels.false;
    }
    return o.optionText;
  };

  return (
    <div className="space-y-2.5">
      {exercise.options.map((o) => {
        const isSelected = selectedId === o.id;
        const showCorrect = checked && o.isCorrect;
        const showWrong = checked && isSelected && !o.isCorrect;
        return (
          <button
            key={o.id}
            type="button"
            disabled={checked}
            onClick={() => onSelect(o.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border-2 p-3.5 text-left transition-all',
              isSelected && !checked && 'border-primary bg-primary/5',
              !isSelected && !checked && 'hover:border-primary/40',
              showCorrect && 'border-green-500 bg-green-500/10',
              showWrong && 'border-destructive bg-destructive/10',
              checked && !showCorrect && !showWrong && 'opacity-60'
            )}
          >
            <span className="font-medium">{label(o)}</span>
            {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {showWrong && <XCircle className="h-5 w-5 text-destructive" />}
          </button>
        );
      })}
    </div>
  );
}

function WordOrder({
  exercise,
  orderedIds,
  checked,
  onChange,
  tapHint,
}: {
  exercise: ExerciseItem;
  orderedIds: number[];
  checked: boolean;
  onChange: (ids: number[]) => void;
  tapHint: string;
}) {
  const shuffled = useMemo(
    () => shuffle(exercise.options),
    [exercise.id]
  );
  const byId = new Map(exercise.options.map((o) => [o.id, o]));

  const toggle = (id: number) => {
    if (checked) return;
    if (orderedIds.includes(id)) {
      onChange(orderedIds.filter((x) => x !== id));
    } else {
      onChange([...orderedIds, id]);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">{tapHint}</p>
      <div className="mb-3 flex min-h-[3rem] flex-wrap gap-2 rounded-xl border-2 border-dashed p-3">
        {orderedIds.length === 0 ? (
          <span className="text-sm text-muted-foreground/60">…</span>
        ) : (
          orderedIds.map((id, i) => (
            <button
              key={`${id}-${i}`}
              type="button"
              disabled={checked}
              onClick={() => toggle(id)}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              {byId.get(id)?.optionText}
            </button>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {shuffled
          .filter((o) => !orderedIds.includes(o.id))
          .map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={checked}
              onClick={() => toggle(o.id)}
              className="rounded-lg border-2 bg-background px-3 py-1.5 text-sm font-medium transition-all hover:border-primary/40"
            >
              {o.optionText}
            </button>
          ))}
      </div>
    </div>
  );
}

function MatchPairs({
  exercise,
  selected,
  checked,
  onChange,
  hint,
}: {
  exercise: ExerciseItem;
  selected: Record<number, string>;
  checked: boolean;
  onChange: (v: Record<number, string>) => void;
  hint: string;
}) {
  const pairs = exercise.options.map((o) => {
    const [dutch, meaning] = o.optionText.split('|');
    return { id: o.id, dutch: dutch ?? '', meaning: meaning ?? '' };
  });
  const meanings = useMemo(
    () => shuffle(pairs.map((p) => p.meaning)),
    [exercise.id]
  );

  const setFor = (id: number, meaning: string) => {
    if (checked) return;
    onChange({ ...selected, [id]: meaning });
  };

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">{hint}</p>
      <div className="space-y-3">
        {pairs.map((p) => {
          const value = selected[p.id];
          const correct = checked && normalize(value ?? '') === normalize(p.meaning);
          return (
            <div
              key={p.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 p-3',
                checked && correct && 'border-green-500 bg-green-500/10',
                checked && !correct && 'border-destructive bg-destructive/10'
              )}
            >
              <span className="w-24 shrink-0 font-display font-bold">
                {p.dutch}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {meanings.map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={checked}
                    onClick={() => setFor(p.id, m)}
                    className={cn(
                      'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                      value === m
                        ? 'border-primary bg-primary/10'
                        : 'hover:border-primary/40'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
