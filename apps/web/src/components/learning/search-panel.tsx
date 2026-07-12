"use client";

import { useMemo, useState } from "react";
import type { LessonSearchEntry } from "@nederstart/content";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SearchPanel({ lessons }: { lessons: LessonSearchEntry[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalized) return { lessons: [], vocabulary: [] };
    return {
      lessons: lessons
        .filter((lesson) =>
          [lesson.code, lesson.title, lesson.objective, lesson.levelCode].some((value) =>
            value.toLowerCase().includes(normalized)
          )
        )
        .slice(0, 12),
      vocabulary: lessons
        .flatMap((lesson) => lesson.vocabulary)
        .filter((item) =>
          [item.textNl, item.translationPt, item.translationEn, item.lessonCode, item.levelCode].some((value) =>
            String(value ?? "").toLowerCase().includes(normalized)
          )
        )
        .slice(0, 20)
    };
  }, [lessons, normalized]);

  return (
    <div className="grid gap-4">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="min-h-12 rounded-component border border-brand-border px-4 text-base"
        placeholder="Search lessons or vocabulary"
      />

      {!normalized ? (
        <Card>
          <p className="text-sm text-brand-muted">Type a Dutch word, Portuguese/English meaning, lesson code or topic.</p>
        </Card>
      ) : null}

      {normalized && results.lessons.length === 0 && results.vocabulary.length === 0 ? (
        <Card>
          <p className="text-sm font-semibold text-brand-text">No results found.</p>
          <p className="mt-1 text-sm text-brand-muted">Try a shorter word or a lesson code like A2-04.</p>
        </Card>
      ) : null}

      {results.lessons.length > 0 ? (
        <Card className="grid gap-3">
          <h2 className="text-xl font-bold text-brand-text">Lessons</h2>
          {results.lessons.map((lesson) => (
            <div key={lesson.code} className="flex flex-col gap-3 rounded-component border border-brand-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-accent">{lesson.code}</p>
                <p className="font-semibold text-brand-text">{lesson.title}</p>
                <p className="text-sm text-brand-muted">{lesson.objective}</p>
              </div>
              <ButtonLink href={`/lessons/${lesson.code}`} variant="secondary">
                Open
              </ButtonLink>
            </div>
          ))}
        </Card>
      ) : null}

      {results.vocabulary.length > 0 ? (
        <Card className="grid gap-3">
          <h2 className="text-xl font-bold text-brand-text">Vocabulary</h2>
          {results.vocabulary.map((item) => (
            <div key={item.id} className="rounded-component border border-brand-border p-3">
              <p className="font-semibold text-brand-text">{item.textNl}</p>
              <p className="text-sm text-brand-muted">PT: {item.translationPt}</p>
              <p className="text-sm text-brand-muted">EN: {item.translationEn}</p>
              <ButtonLink href={`/lessons/${item.lessonCode}`} variant="ghost" className="mt-2 px-0">
                {item.lessonCode} - {item.lessonTitle}
              </ButtonLink>
            </div>
          ))}
        </Card>
      ) : null}
    </div>
  );
}
