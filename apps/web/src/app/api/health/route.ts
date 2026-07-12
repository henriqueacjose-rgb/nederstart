import { NextResponse } from "next/server";
import { lessons } from "@nederstart/content";
import { getEnvironmentStatus } from "@/lib/env/validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function GET() {
  const env = getEnvironmentStatus();
  return NextResponse.json({
    status: "ok",
    service: "nederstart-web",
    phase: "deploy-ready",
    lessonUx: "audio-first-template",
    supabaseConfigured: isSupabaseConfigured(),
    serviceRoleConfigured: env.serviceRoleConfigured,
    requireAuth: env.requireAuth,
    appEnv: env.appEnv,
    audioBucket: env.audioBucket,
    lessonCount: lessons.length
  });
}
