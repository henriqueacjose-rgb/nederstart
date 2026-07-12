import { NextResponse } from "next/server";
import { lessonDetails, lessons } from "@nederstart/content";
import { getEnvironmentStatus } from "@/lib/env/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CheckResult = {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

function result(name: string, status: CheckResult["status"], detail: string): CheckResult {
  return { name, status, detail };
}

export async function GET() {
  const env = getEnvironmentStatus();
  const checks: CheckResult[] = [
    result("environment", env.isProduction ? "pass" : "warn", `mode=${env.appEnv}`),
    result(
      "supabase-config",
      env.supabaseConfigured ? "pass" : "warn",
      env.supabaseConfigured ? "Supabase env vars are present." : `Missing: ${env.missing.join(", ")}`
    ),
    result("curriculum-count", lessonDetails.length === 50 ? "pass" : "fail", `${lessonDetails.length} lessons loaded`),
    result("lesson-count", lessons.length === 50 ? "pass" : "fail", `${lessons.length} lesson summaries loaded`),
    result(
      "audio-placeholder-count",
      lessonDetails.flatMap((lesson) => lesson.audioPlaceholders).length > 0 ? "pass" : "fail",
      `${lessonDetails.flatMap((lesson) => lesson.audioPlaceholders).length} audio placeholders loaded`
    )
  ];

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    checks.push(result("auth", "warn", "Skipped: Supabase is not configured."));
    checks.push(result("database", "warn", "Skipped: Supabase is not configured."));
    checks.push(result("storage", "warn", "Skipped: Supabase is not configured."));
    checks.push(result("progress-write-test", "warn", "Skipped: Supabase is not configured."));
    return NextResponse.json({ status: "warn", env, checks });
  }

  const userResult = await supabase.auth.getUser();
  checks.push(
    result(
      "auth",
      userResult.error ? "warn" : "pass",
      userResult.error ? "No authenticated user for write test." : `Authenticated as ${userResult.data.user.email ?? userResult.data.user.id}`
    )
  );

  const dbResult = await supabase.from("lessons").select("code", { count: "exact", head: true });
  checks.push(
    result("database", dbResult.error ? "fail" : "pass", dbResult.error?.message ?? `${dbResult.count ?? 0} lessons in DB`)
  );

  const storageResult = await supabase.storage.from(env.audioBucket).list("", { limit: 1 });
  checks.push(
    result(
      "storage",
      storageResult.error ? "fail" : "pass",
      storageResult.error?.message ?? `Bucket ${env.audioBucket} is reachable`
    )
  );

  if (!userResult.data.user) {
    checks.push(result("progress-write-test", "warn", "Skipped: no authenticated user."));
  } else {
    const lessonResult = await supabase.from("lessons").select("id").eq("code", "A0-01").single();
    if (lessonResult.error || !lessonResult.data?.id) {
      checks.push(result("progress-write-test", "fail", lessonResult.error?.message ?? "A0-01 not found."));
    } else {
      const write = await supabase.from("progress_events").insert({
        user_id: userResult.data.user.id,
        lesson_id: lessonResult.data.id,
        event_type: "beta_check",
        event_payload: { source: "beta-check" }
      });
      checks.push(result("progress-write-test", write.error ? "fail" : "pass", write.error?.message ?? "Progress event inserted."));
    }
  }

  const status = checks.some((check) => check.status === "fail")
    ? "fail"
    : checks.some((check) => check.status === "warn")
      ? "warn"
      : "pass";

  return NextResponse.json({ status, env, checks });
}
