import { getLevelsWithProgress, lessons } from "@nederstart/content";
import { LevelsOverview } from "@/components/learning/levels-overview";

export default function LevelsPage() {
  const levels = getLevelsWithProgress();

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-semibold text-brand-accent">Levels</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Choose your level</h1>
        <p className="mt-2 text-brand-muted">All A0-B2 levels are loaded with real NederStart content.</p>
      </section>
      <LevelsOverview levels={levels} lessons={lessons} />
    </div>
  );
}
