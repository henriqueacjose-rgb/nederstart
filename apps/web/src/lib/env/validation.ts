export type EnvironmentStatus = {
  appEnv: string;
  isProduction: boolean;
  requireAuth: boolean;
  audioBucket: string;
  supabaseConfigured: boolean;
  serviceRoleConfigured: boolean;
  missing: string[];
};

const requiredSupabaseVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

export function getEnvironmentStatus(): EnvironmentStatus {
  const missing = requiredSupabaseVars.filter((key) => !process.env[key]);
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development";
  const isProduction = appEnv === "production" || process.env.NODE_ENV === "production";
  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    appEnv,
    isProduction,
    requireAuth: process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true",
    audioBucket: process.env.NEXT_PUBLIC_AUDIO_BUCKET ?? "native-audio",
    supabaseConfigured: missing.length === 0,
    serviceRoleConfigured,
    missing
  };
}

export function assertProductionEnvironment() {
  const status = getEnvironmentStatus();
  const missingProductionVars = [
    ...status.missing,
    ...(status.isProduction && !status.serviceRoleConfigured ? ["SUPABASE_SERVICE_ROLE_KEY"] : [])
  ];

  if (status.isProduction && missingProductionVars.length > 0) {
    throw new Error(`Production deploy is missing env vars: ${missingProductionVars.join(", ")}`);
  }
  return status;
}
