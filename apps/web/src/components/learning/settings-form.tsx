"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SettingsState = {
  baseLanguage: "pt" | "en";
  preferredAudioSpeed: "slow" | "natural";
  theme: "light" | "dark";
  dailyGoalMinutes: number;
  focus: string;
};

const defaults: SettingsState = {
  baseLanguage: "pt",
  preferredAudioSpeed: "natural",
  theme: "light",
  dailyGoalMinutes: 20,
  focus: "daily-life"
};

export function SettingsForm() {
  const [settings, setSettings] = useState<SettingsState>(defaults);
  const [state, setState] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setState("idle");
        setMessage("Supabase is not configured. Settings preview is local only.");
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setState("idle");
        setMessage("Log in to sync settings.");
        return;
      }

      setState("loading");
      const { data, error } = await supabase.from("settings").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setSettings({
          baseLanguage: data.base_language_code ?? "pt",
          preferredAudioSpeed: data.preferred_audio_speed ?? "natural",
          theme: data.theme ?? "light",
          dailyGoalMinutes: data.daily_goal_minutes ?? 20,
          focus: data.learning_preferences_json?.focus ?? "daily-life"
        });
      }
      if (error) {
        setMessage(error.message);
      }
      setState("idle");
    }

    void load();
  }, []);

  async function save() {
    setState("loading");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setState("saved");
      setMessage("Settings saved for this preview session.");
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setState("error");
      setMessage("Log in to save settings.");
      return;
    }

    const { error } = await supabase.from("settings").upsert(
      {
        user_id: user.id,
        base_language_code: settings.baseLanguage,
        preferred_audio_speed: settings.preferredAudioSpeed,
        playback_speed: settings.preferredAudioSpeed === "slow" ? 0.75 : 1,
        theme: settings.theme,
        daily_goal_minutes: settings.dailyGoalMinutes,
        learning_preferences_json: { focus: settings.focus }
      },
      { onConflict: "user_id" }
    );

    setState(error ? "error" : "saved");
    setMessage(error?.message ?? "Settings synced.");
  }

  return (
    <Card className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-brand-text">
          Base language
          <select
            value={settings.baseLanguage}
            onChange={(event) => setSettings((value) => ({ ...value, baseLanguage: event.target.value as "pt" | "en" }))}
            className="min-h-11 rounded-component border border-brand-border px-3"
          >
            <option value="pt">Portuguese</option>
            <option value="en">English</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-brand-text">
          Audio speed
          <select
            value={settings.preferredAudioSpeed}
            onChange={(event) =>
              setSettings((value) => ({ ...value, preferredAudioSpeed: event.target.value as "slow" | "natural" }))
            }
            className="min-h-11 rounded-component border border-brand-border px-3"
          >
            <option value="slow">Slow</option>
            <option value="natural">Natural</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-brand-text">
          Theme
          <select
            value={settings.theme}
            onChange={(event) => setSettings((value) => ({ ...value, theme: event.target.value as "light" | "dark" }))}
            className="min-h-11 rounded-component border border-brand-border px-3"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-brand-text">
          Daily goal
          <input
            type="number"
            min={5}
            max={180}
            value={settings.dailyGoalMinutes}
            onChange={(event) => setSettings((value) => ({ ...value, dailyGoalMinutes: Number(event.target.value) }))}
            className="min-h-11 rounded-component border border-brand-border px-3"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-brand-text md:col-span-2">
          Learning focus
          <select
            value={settings.focus}
            onChange={(event) => setSettings((value) => ({ ...value, focus: event.target.value }))}
            className="min-h-11 rounded-component border border-brand-border px-3"
          >
            <option value="daily-life">Daily life</option>
            <option value="work">Work</option>
            <option value="healthcare">Healthcare</option>
            <option value="municipality">Gemeente and documents</option>
          </select>
        </label>
      </div>

      {message ? (
        <p className={`rounded-component p-3 text-sm font-semibold ${state === "error" ? "bg-[#FFF3E8] text-brand-warning" : "bg-[#E3F3EC] text-brand-success"}`}>
          {message}
        </p>
      ) : null}

      <Button type="button" onClick={save} disabled={state === "loading"}>
        {state === "loading" ? "Saving..." : "Save settings"}
      </Button>
    </Card>
  );
}
