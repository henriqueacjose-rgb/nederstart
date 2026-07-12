import { BetaCheckPanel } from "@/components/learning/beta-check-panel";

export default function BetaCheckPage() {
  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-semibold text-brand-accent">Beta check</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Deployment readiness</h1>
        <p className="mt-2 text-brand-muted">Internal QA route for Supabase, curriculum and beta readiness checks.</p>
      </section>
      <BetaCheckPanel />
    </div>
  );
}
