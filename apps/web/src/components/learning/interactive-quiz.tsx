"use client";

import { useMemo, useState } from "react";
import type { PhraseItem, QuizQuestion, VocabularyItem } from "@nederstart/shared";
import { saveQuizAttempt, updateLessonProgress } from "@/lib/learning/progress-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/progress-bar";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[.!?]/g, "");
}

function buildAnswers(questions: QuizQuestion[], vocabulary: VocabularyItem[], phrases: PhraseItem[]) {
  return questions.slice(0, 5).map((question, index) => {
    const vocab = vocabulary[index % Math.max(1, vocabulary.length)];
    const phrase = phrases[index % Math.max(1, phrases.length)];
    return {
      id: question.id,
      prompt: question.prompt,
      answer: vocab?.textNl || phrase?.textNl || "ok"
    };
  });
}

export function InteractiveQuiz({
  lessonCode,
  questions,
  vocabulary,
  phrases
}: {
  lessonCode: string;
  questions: QuizQuestion[];
  vocabulary: VocabularyItem[];
  phrases: PhraseItem[];
}) {
  const items = useMemo(() => buildAnswers(questions, vocabulary, phrases), [phrases, questions, vocabulary]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const current = items[index];

  const answered = Object.keys(answers).length;
  const score =
    items.length === 0
      ? 0
      : Math.round(
          (items.filter((item) => normalize(answers[item.id] ?? "") === normalize(item.answer)).length / items.length) *
            100
        );
  const passed = score >= 70;

  function submit() {
    setSubmitted(true);
    void saveQuizAttempt(lessonCode, score, answers);
    if (passed) void updateLessonProgress(lessonCode, { quizCompleted: true });
  }

  if (!current) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-brand-text">Quiz</h2>
        <p className="mt-2 text-sm text-brand-muted">No quiz questions available yet.</p>
      </Card>
    );
  }

  return (
    <Card className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-brand-accent">Quiz</p>
        <h2 className="mt-1 text-xl font-bold text-brand-text">Lesson check</h2>
      </div>

      <ProgressBar value={Math.round((answered / items.length) * 100)} label="Quiz progress" />

      {!submitted ? (
        <div className="grid gap-4">
          <div className="rounded-component border border-brand-border p-4">
            <p className="text-sm font-semibold text-brand-accent">
              Question {index + 1} of {items.length}
            </p>
            <p className="mt-2 font-semibold text-brand-text">{current.prompt}</p>
            <input
              value={answers[current.id] ?? ""}
              onChange={(event) => setAnswers((value) => ({ ...value, [current.id]: event.target.value }))}
              className="mt-4 min-h-11 w-full rounded-component border border-brand-border px-3 text-sm"
              placeholder="Type your answer"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setIndex((value) => Math.max(0, value - 1))}>
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIndex((value) => Math.min(items.length - 1, value + 1))}
            >
              Next
            </Button>
            <Button type="button" onClick={submit} disabled={answered < items.length}>
              Submit quiz
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className={`rounded-component p-3 text-sm font-semibold ${passed ? "bg-[#E3F3EC] text-brand-success" : "bg-[#FFF3E8] text-brand-warning"}`}>
            Score: {score}%. {passed ? "Passed." : "Not passed yet. Review and try again."}
          </p>
          <div className="grid gap-2">
            {items.map((item) => {
              const correct = normalize(answers[item.id] ?? "") === normalize(item.answer);
              return (
                <div key={item.id} className="rounded-component border border-brand-border p-3 text-sm">
                  <p className="font-semibold text-brand-text">{item.prompt}</p>
                  <p className={correct ? "text-brand-success" : "text-brand-warning"}>
                    Your answer: {answers[item.id] || "(empty)"}
                  </p>
                  <p className="text-brand-muted">Expected: {item.answer}</p>
                </div>
              );
            })}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setIndex(0);
            }}
          >
            Try again
          </Button>
        </div>
      )}
    </Card>
  );
}
