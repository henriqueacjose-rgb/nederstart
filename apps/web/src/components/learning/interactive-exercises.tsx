"use client";

import { useMemo, useState } from "react";
import type { ExerciseItem, PhraseItem, VocabularyItem } from "@nederstart/shared";
import { updateLessonProgress } from "@/lib/learning/progress-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ExerciseModel =
  | { id: string; type: "multiple_choice"; prompt: string; answer: string; options: string[] }
  | { id: string; type: "fill_blank"; prompt: string; answer: string }
  | { id: string; type: "order_words"; prompt: string; answer: string; words: string[] }
  | { id: string; type: "short_answer"; prompt: string; answer: string };

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[.!?]/g, "");
}

function shuffleWords(words: string[]) {
  return [...words].sort((a, b) => a.localeCompare(b)).reverse();
}

function buildExercises(
  vocabulary: VocabularyItem[],
  phrases: PhraseItem[],
  sourceExercises: ExerciseItem[]
): ExerciseModel[] {
  const firstPhrase = phrases[0];
  const secondPhrase = phrases[1] ?? phrases[0];
  const thirdPhrase = phrases[2] ?? phrases[0];
  const firstWord = vocabulary[0];
  const options = [firstPhrase?.translationPt, phrases[1]?.translationPt, phrases[2]?.translationPt]
    .filter(Boolean)
    .slice(0, 3) as string[];

  return [
    firstPhrase
      ? {
          id: "multiple-choice-1",
          type: "multiple_choice",
          prompt: `What does "${firstPhrase.textNl}" mean?`,
          answer: firstPhrase.translationPt,
          options: options.length >= 2 ? options : [firstPhrase.translationPt, "Nao sei", "Outra frase"]
        }
      : undefined,
    secondPhrase
      ? {
          id: "fill-blank-1",
          type: "fill_blank",
          prompt: secondPhrase.textNl.replace(secondPhrase.textNl.split(/\s+/)[0], "_____"),
          answer: secondPhrase.textNl.split(/\s+/)[0]
        }
      : undefined,
    thirdPhrase
      ? {
          id: "order-words-1",
          type: "order_words",
          prompt: "Put the Dutch words in the correct order.",
          answer: thirdPhrase.textNl,
          words: shuffleWords(thirdPhrase.textNl.split(/\s+/))
        }
      : undefined,
    firstWord
      ? {
          id: "short-answer-1",
          type: "short_answer",
          prompt: sourceExercises[0]?.prompt ?? `Write the Dutch word for: ${firstWord.translationPt}`,
          answer: firstWord.textNl
        }
      : undefined
  ].filter(Boolean) as ExerciseModel[];
}

export function InteractiveExercises({
  lessonCode,
  vocabulary,
  phrases,
  exercises
}: {
  lessonCode: string;
  vocabulary: VocabularyItem[];
  phrases: PhraseItem[];
  exercises: ExerciseItem[];
}) {
  const models = useMemo(() => buildExercises(vocabulary, phrases, exercises), [exercises, phrases, vocabulary]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const results = models.map((exercise) => ({
    id: exercise.id,
    correct: normalize(answers[exercise.id] ?? "") === normalize(exercise.answer)
  }));
  const score = models.length === 0 ? 0 : Math.round((results.filter((item) => item.correct).length / models.length) * 100);

  function submit() {
    setChecked(true);
    if (score >= 70) updateLessonProgress(lessonCode, { exercisesCompleted: true });
  }

  if (models.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-brand-text">Exercises</h2>
        <p className="mt-2 text-sm text-brand-muted">No interactive exercises available yet.</p>
      </Card>
    );
  }

  return (
    <Card className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-brand-accent">Interactive practice</p>
        <h2 className="mt-1 text-xl font-bold text-brand-text">Exercises</h2>
      </div>

      <div className="grid gap-4">
        {models.map((exercise) => (
          <div key={exercise.id} className="grid gap-3 rounded-component border border-brand-border p-3">
            <div>
              <p className="text-xs font-semibold uppercase text-brand-accent">{exercise.type.replace("_", " ")}</p>
              <p className="mt-1 font-semibold text-brand-text">{exercise.prompt}</p>
            </div>

            {exercise.type === "multiple_choice" ? (
              <div className="grid gap-2">
                {exercise.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((current) => ({ ...current, [exercise.id]: option }))}
                    className={`rounded-component border px-3 py-2 text-left text-sm transition ${
                      answers[exercise.id] === option
                        ? "border-brand-primary bg-brand-background text-brand-primary"
                        : "border-brand-border text-brand-muted hover:bg-brand-background"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : exercise.type === "order_words" ? (
              <input
                value={answers[exercise.id] ?? ""}
                onChange={(event) => setAnswers((current) => ({ ...current, [exercise.id]: event.target.value }))}
                placeholder={exercise.words.join(" / ")}
                className="min-h-11 rounded-component border border-brand-border px-3 text-sm"
              />
            ) : (
              <input
                value={answers[exercise.id] ?? ""}
                onChange={(event) => setAnswers((current) => ({ ...current, [exercise.id]: event.target.value }))}
                className="min-h-11 rounded-component border border-brand-border px-3 text-sm"
              />
            )}

            {checked ? (
              <p className={`text-sm font-semibold ${results.find((item) => item.id === exercise.id)?.correct ? "text-brand-success" : "text-brand-warning"}`}>
                {results.find((item) => item.id === exercise.id)?.correct
                  ? "Correct"
                  : `Review: expected "${exercise.answer}"`}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {checked ? (
        <p className="rounded-component bg-brand-background p-3 text-sm font-semibold text-brand-text">
          Score: {score}%. {score >= 70 ? "Exercises completed." : "Try again and aim for 70%."}
        </p>
      ) : null}

      <Button type="button" onClick={submit}>
        Check exercises
      </Button>
    </Card>
  );
}
