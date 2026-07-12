import { getLevelsWithProgress, lessons } from "@nederstart/content";
import { DashboardProgressPanel } from "@/components/learning/dashboard-progress-panel";

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-semibold text-brand-accent">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Continue learning</h1>
        <p className="mt-2 text-brand-muted">
          Your next action is clear: open the current lesson and keep building the habit.
        </p>
      </section>

      <DashboardProgressPanel initialLessons={lessons} initialLevels={getLevelsWithProgress()} />
    </div>
  );
}
