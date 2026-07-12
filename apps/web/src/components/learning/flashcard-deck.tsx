"use client";

import { useMemo, useState } from "react";
import type { FlashcardItem } from "@nederstart/shared";
import { updateLessonProgress } from "@/lib/learning/progress-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/progress-bar";

export function FlashcardDeck({ lessonCode, flashcards }: { lessonCode: string; flashcards: FlashcardItem[] }) {
  const cards = useMemo(() => flashcards.slice(0, 12), [flashcards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Record<string, boolean>>({});
  const [review, setReview] = useState<Record<string, boolean>>({});
  const current = cards[index];
  const evaluated = Object.keys(known).length + Object.keys(review).length;

  function mark(value: "known" | "review") {
    if (!current) return;
    if (value === "known") {
      setKnown((items) => ({ ...items, [current.id]: true }));
      setReview((items) => {
        const next = { ...items };
        delete next[current.id];
        return next;
      });
    } else {
      setReview((items) => ({ ...items, [current.id]: true }));
      setKnown((items) => {
        const next = { ...items };
        delete next[current.id];
        return next;
      });
    }
    if (evaluated + 1 >= Math.min(5, cards.length)) updateLessonProgress(lessonCode, { flashcardsCompleted: true });
    setFlipped(false);
    setIndex((valueIndex) => (valueIndex + 1) % cards.length);
  }

  if (!current) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-brand-text">Flashcards</h2>
        <p className="mt-2 text-sm text-brand-muted">No flashcards available yet.</p>
      </Card>
    );
  }

  return (
    <Card className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-brand-accent">Flashcards</p>
        <h2 className="mt-1 text-xl font-bold text-brand-text">Review deck</h2>
      </div>
      <ProgressBar value={Math.round((evaluated / Math.max(1, cards.length)) * 100)} label="Cards reviewed" />

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="min-h-40 rounded-component border border-brand-border bg-brand-background p-6 text-left shadow-soft transition hover:-translate-y-0.5 hover:bg-white"
      >
        <p className="text-xs font-semibold uppercase text-brand-accent">
          Card {index + 1} of {cards.length}
        </p>
        <p className="mt-4 text-2xl font-bold text-brand-text">{flipped ? current.back : current.front}</p>
        <p className="mt-4 text-sm text-brand-muted">{flipped ? "Back" : "Front"} - tap to flip</p>
      </button>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => mark("known")}>
          Mark known
        </Button>
        <Button type="button" variant="secondary" onClick={() => mark("review")}>
          Review later
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setFlipped(false);
            setIndex((value) => (value + 1) % cards.length);
          }}
        >
          Next
        </Button>
      </div>

      <p className="text-sm text-brand-muted">
        Known: {Object.keys(known).length}. Review later: {Object.keys(review).length}. These states are ready for
        spaced repetition in a future sprint.
      </p>
    </Card>
  );
}
