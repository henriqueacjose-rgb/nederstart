import { getLessonsByLevel, getLevelByCode } from "@nederstart/content";
import { notFound } from "next/navigation";
import { LessonListPanel } from "@/components/learning/lesson-list-panel";

export default function LessonListPage({ params }: { params: { levelCode: string } }) {
  const level = getLevelByCode(params.levelCode);
  if (!level) notFound();

  const levelLessons = getLessonsByLevel(params.levelCode);

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-semibold text-brand-accent">{level.code}</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">{level.title}</h1>
        <p className="mt-2 text-brand-muted">{level.description}</p>
      </section>
      <LessonListPanel lessons={levelLessons} />
    </div>
  );
}
