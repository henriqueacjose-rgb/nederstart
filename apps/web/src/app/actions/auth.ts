"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/admin";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const baseLanguage = getString(formData, "baseLanguage") || "pt";
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/register?error=Supabase%20is%20not%20configured");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        base_language_code: baseLanguage
      }
    }
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(`/login?error=${encodeURIComponent("Check your email to confirm your account before signing in.")}`);
  }

  const userId = data.user?.id;
  if (userId) {
    const profileResult = await ensureUserProfile({
      userId,
      email,
      name,
      baseLanguageCode: baseLanguage
    });

    const shouldFailFast = process.env.NEXT_PUBLIC_APP_ENV === "production" || process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";
    if (!profileResult.success && shouldFailFast) {
      redirect(`/register?error=${encodeURIComponent("Profile setup failed. Ensure SUPABASE_SERVICE_ROLE_KEY is configured.")}`);
    }
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}

export async function recoverPasswordAction(formData: FormData) {
  const email = getString(formData, "email");
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/forgot-password?error=Supabase%20is%20not%20configured");

  const forwardedHost = headers().get("x-forwarded-host");
  const host = forwardedHost?.split(",")[0] ?? headers().get("host");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (host ? `https://${host}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const redirectTo = `${appUrl}/login`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?sent=true");
}
