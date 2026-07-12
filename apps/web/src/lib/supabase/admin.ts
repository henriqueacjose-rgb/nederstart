import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function createSupabaseAdminClient() {
  if (!isSupabaseConfigured()) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

type EnsureProfileInput = {
  userId: string;
  email: string;
  name?: string;
  baseLanguageCode?: string;
};

export async function ensureUserProfile({ userId, email, name, baseLanguageCode }: EnsureProfileInput) {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return { success: false, created: false, reason: "service-role-unavailable" as const };
  }

  const { data: existingProfile, error: lookupError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (lookupError) {
    return { success: false, created: false, reason: lookupError.message };
  }

  if (existingProfile?.id) {
    return { success: true, created: false };
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: userId,
    name: name?.trim() || email.split("@")[0] || "Learner",
    email,
    base_language_code: baseLanguageCode || "pt",
    current_level_code: "A0"
  });

  if (profileError) {
    return { success: false, created: false, reason: profileError.message };
  }

  const { error: settingsError } = await adminClient.from("settings").upsert(
    {
      user_id: userId,
      base_language_code: baseLanguageCode || "pt",
      preferred_audio_speed: "natural",
      playback_speed: 1,
      theme: "light",
      daily_goal_minutes: 20,
      accessibility_preferences_json: {},
      learning_preferences_json: { focus: "daily-life" },
      email_notifications: true
    },
    { onConflict: "user_id" }
  );

  if (settingsError) {
    return { success: false, created: false, reason: settingsError.message };
  }

  return { success: true, created: true };
}
