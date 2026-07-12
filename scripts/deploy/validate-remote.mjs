const baseUrl = process.argv[2] ?? process.env.NEXT_PUBLIC_APP_URL;

if (!baseUrl) {
  console.error("Usage: node scripts/deploy/validate-remote.mjs https://your-deploy.vercel.app");
  process.exit(1);
}

const routes = [
  "/api/health",
  "/api/beta-check",
  "/login",
  "/register",
  "/forgot-password",
  "/levels",
  "/search",
  "/settings"
];

async function checkRoute(route) {
  const url = new URL(route, baseUrl).toString();
  const response = await fetch(url, { redirect: "manual" });
  const text = await response.text();
  const ok = response.status >= 200 && response.status < 400;
  console.log(`${ok ? "PASS" : "FAIL"} ${response.status} ${route}`);
  if (!ok) console.log(text.slice(0, 500));
  return ok;
}

const results = [];
for (const route of routes) {
  results.push(await checkRoute(route));
}

const betaResponse = await fetch(new URL("/api/beta-check", baseUrl));
const beta = await betaResponse.json();
console.log("\nBeta check summary:");
console.log(JSON.stringify(beta, null, 2));

if (results.some((ok) => !ok) || beta.status === "fail") {
  process.exit(1);
}
