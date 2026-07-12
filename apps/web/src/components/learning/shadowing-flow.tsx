"use client";

import { useState } from "react";
import type { PhraseItem } from "@nederstart/shared";
import { updateLessonProgress } from "@/lib/learning/progress-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const steps = ["Listen", "Repeat", "Repeat with audio", "Self evaluation", "Complete"] as const;

export function ShadowingFlow({ lessonCode, phrases }: { lessonCode: string; phrases: PhraseItem[] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [rating, setRating] = useState<string>("");
  const phrase = phrases[phraseIndex] ?? phrases[0];

  function next() {
    if (stepIndex === steps.length - 1) {
      updateLessonProgress(lessonCode, { shadowingCompleted: true });
      return;
    }
    setStepIndex((value) => value + 1);
  }

  if (!phrase) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-brand-text">Shadowing</h2>
        <p className="mt-2 text-sm text-brand-muted">No phrases available for shadowing yet.</p>
      </Card>
    );
  }

  const currentStep = steps[stepIndex];

  return (
    <Card className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-brand-accent">Shadowing</p>
        <h2 className="mt-1 text-xl font-bold text-brand-text">{currentStep}</h2>
      </div>

      <div className="grid gap-2 sm:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-component px-3 py-2 text-center text-xs font-semibold transition ${
              index <= stepIndex ? "bg-brand-primary text-white" : "bg-brand-background text-brand-muted"
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <div className="rounded-component border border-brand-border bg-brand-background p-4">
        <p className="text-lg font-bold text-brand-text">{phrase.textNl}</p>
        <p className="mt-2 text-sm text-brand-muted">PT: {phrase.translationPt}</p>
        <p className="text-sm text-brand-muted">EN: {phrase.translationEn}</p>
        {phrase.soundBlocks ? <p className="mt-2 text-sm text-brand-muted">Blocks: {phrase.soundBlocks}</p> : null}
      </div>

      {currentStep === "Listen" ? (
        <p className="text-sm leading-6 text-brand-muted">Listen once without speaking. Focus on rhythm and stress.</p>
      ) : null}
      {currentStep === "Repeat" ? (
        <p className="text-sm leading-6 text-brand-muted">Repeat slowly by blocks. Keep the Dutch rhythm, not Portuguese or English rhythm.</p>
      ) : null}
      {currentStep === "Repeat with audio" ? (
        <p className="text-sm leading-6 text-brand-muted">Speak at the same time as the audio reference. Match the length of each sound.</p>
      ) : null}
      {currentStep === "Self evaluation" ? (
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-brand-text">How close was your pronunciation?</p>
          <div className="flex flex-wrap gap-2">
            {["Needs work", "Understandable", "Confident"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`rounded-component border px-3 py-2 text-sm font-semibold transition ${
                  rating === value
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-border bg-white text-brand-muted hover:bg-brand-background"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {currentStep === "Complete" ? (
        <p className="rounded-component bg-[#E3F3EC] p-3 text-sm font-semibold text-brand-success">
          Shadowing round complete. Save it to update lesson progress.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={next} disabled={currentStep === "Self evaluation" && !rating}>
          {currentStep === "Complete" ? "Save shadowing" : "Next step"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setStepIndex(0);
            setPhraseIndex((value) => (value + 1) % phrases.length);
            setRating("");
          }}
        >
          Change phrase
        </Button>
      </div>
    </Card>
  );
}
