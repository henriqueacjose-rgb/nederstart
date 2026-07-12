/** @type {import("next").NextConfig} */
const isProductionDeploy =
  process.env.NEXT_PUBLIC_APP_ENV === "production" || process.env.VERCEL_ENV === "production";

if (isProductionDeploy) {
  const missing = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(
    (key) => !process.env[key],
  );
  if (missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }
}

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@nederstart/content", "@nederstart/core", "@nederstart/shared"]
};

export default nextConfig;
