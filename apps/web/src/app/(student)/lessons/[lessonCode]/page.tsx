import { getLessonByCode } from "@nederstart/content";
import { notFound } from "next/navigation";
import type { ContentBlock } from "@nederstart/shared";
import { LessonExperience } from "@/components/learning/lesson-experience";
import { PhraseCard } from "@/components/learning/phrase-card";
import { VocabularyCard } from "@/components/learning/vocabulary-card";
import { ProgressBar } from "@/components/progress/progress-bar";
import { Card } from "@/components/ui/card";

function ContentBlockCard({ block }: { block: ContentBlock }) {
  return (
    <Card>
      <details>
        <summary className="cursor-pointer text-xl font-bold text-brand-text">{block.title}</summary>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-brand-muted">{block.body}</div>
      </details>
    </Card>
  );
}

export default function LessonPage({ params }: { params: { lessonCode: string } }) {
  const lesson = getLessonByCode(params.lessonCode);
  if (!lesson) notFound();

  const priorityBlocks = lesson.contentBlocks.filter((block) =>
    [
      "contexto real de utilizacao",
      "objetivos da licao",
      "gramatica necessaria",
      "explicacao fisica dos sons dificeis",
      "boca lingua e garganta",
      "ritmo e entoacao",
      "exercicios de audicao",
      "exercicios escritos",
      "exercicios orais",
      "mini dialogo realista",
      "erros comuns",
      "criterios de dominio"
    ].includes(block.type)
  );
  const remainingBlocks = lesson.contentBlocks.filter(
    (block) => !priorityBlocks.some((priorityBlock) => priorityBlock.id === block.id)
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <section className="grid gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-accent">{lesson.code}</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-text">{lesson.title}</h1>
          <p className="mt-2 text-brand-muted">{lesson.objective}</p>
        </div>

        <Card>
          <h2 className="text-xl font-bold text-brand-text">Lesson objective</h2>
          <p className="mt-2 text-brand-muted">{lesson.objective}</p>
        </Card>

        <section className="grid gap-3" aria-labelledby="lesson-vocabulary">
          <div>
            <p className="text-sm font-semibold text-brand-accent">Audio-first</p>
            <h2 id="lesson-vocabulary" className="mt-1 text-2xl font-bold text-brand-text">
              Vocabulary
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {lesson.vocabulary.map((item) => (
              <VocabularyCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="grid gap-3" aria-labelledby="lesson-phrases">
          <div>
            <p className="text-sm font-semibold text-brand-accent">Listen, repeat, shadow</p>
            <h2 id="lesson-phrases" className="mt-1 text-2xl font-bold text-brand-text">
              Useful phrases
            </h2>
          </div>
          <div className="grid gap-3">
            {lesson.phrases.map((item) => (
              <PhraseCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <LessonExperience lesson={lesson} />

        {priorityBlocks.map((block) => (
          <ContentBlockCard key={block.id} block={block} />
        ))}

        <Card className="grid gap-3">
          <h2 className="text-xl font-bold text-brand-text">All imported lesson sections</h2>
          <div className="grid gap-3">
            {remainingBlocks.map((block) => (
              <details key={block.id} className="rounded-component border border-brand-border p-3">
                <summary className="cursor-pointer font-semibold text-brand-text">{block.title}</summary>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-brand-muted">{block.body}</div>
              </details>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-brand-text">Roleplay</h2>
          <div className="mt-4 grid gap-3">
            {lesson.roleplays.map((item) => (
              <div key={item.id} className="whitespace-pre-wrap rounded-component border border-brand-border p-3 text-sm leading-7 text-brand-muted">
                {item.scenario}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <aside className="grid h-fit gap-4 lg:sticky lg:top-24">
        <Card className="grid gap-4">
          <h2 className="text-lg font-bold text-brand-text">Lesson progress</h2>
          <ProgressBar value={lesson.progress} label="Overall" />
          <ul className="grid gap-2 text-sm text-brand-muted">
            <li>{lesson.contentBlocks.length} content blocks</li>
            <li>{lesson.vocabulary.length} vocabulary items</li>
            <li>{lesson.phrases.length} phrases</li>
            <li>{lesson.exercises.length} exercises</li>
            <li>{lesson.quizQuestions.length} quiz prompts</li>
            <li>{lesson.flashcards.length} flashcards</li>
            <li>{lesson.roleplays.length} roleplay sets</li>
            <li>{lesson.audioPlaceholders.length} audio placeholders</li>
          </ul>
        </Card>
      </aside>
    </div>
  );
}
