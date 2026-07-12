import { SettingsForm } from "@/components/learning/settings-form";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-semibold text-brand-accent">Settings</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-text">Learning preferences</h1>
        <p className="mt-2 text-brand-muted">Control language, audio and study preferences for your account.</p>
      </section>
      <SettingsForm />
    </div>
  );
}
