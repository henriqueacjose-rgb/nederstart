import { getProgressSummary } from "@nederstart/content";
import { ProgressOverview } from "@/components/learning/progress-overview";

export default function ProgressPage() {
  const summary = getProgressSummary();

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-semibold text-brand-accent">Progress</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Track your learning</h1>
        <p className="mt-2 text-brand-muted">Real A0/A1 lesson states are loaded from the MVP mock store.</p>
      </section>

      <ProgressOverview initialLevels={summary.levels} initialLessons={summary.lessons} />
    </div>
  );
}
