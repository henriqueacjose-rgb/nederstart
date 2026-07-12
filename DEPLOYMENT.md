# NederStart Deployment

## 1. Supabase remote setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `packages/database/schema/001_initial_schema.sql`.
4. Run `packages/database/seeds/002_seed_full_curriculum.sql`.
5. Confirm the seed imported:
   - 5 levels
   - 50 lessons
   - vocabulary, phrases, exercises, quizzes, flashcards, roleplays
   - audio placeholders

## 2. Supabase Auth

1. Enable Email/Password auth.
2. Set Site URL to the deployed Vercel URL.
3. Add redirect URLs:
   - `http://localhost:3000/login`
   - `https://YOUR-VERCEL-DOMAIN/login`
4. Create 5-10 test users for the closed beta.

## 3. Supabase Storage

The schema creates the `native-audio` bucket.

Validate:
1. Bucket exists: `native-audio`
2. Public read policy exists.
3. Authenticated upload/update policies exist.
4. Test upload through `POST /api/audio/upload` after login.

## 4. Environment variables

Set these in Vercel Project Settings:

```env
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://YOUR-VERCEL-DOMAIN
NEXT_PUBLIC_REQUIRE_AUTH=true
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_AUDIO_BUCKET=native-audio
```

Local development can keep `NEXT_PUBLIC_REQUIRE_AUTH=false`.

## 5. Vercel deploy

1. Import the repository/project in Vercel.
2. Set Root Directory to `nederstart`.
3. Build command:

```bash
pnpm --filter @nederstart/web build
```

4. Install command:

```bash
pnpm install
```

5. Output is handled by Next.js.

## 6. Post-deploy validation

Run locally:

```bash
node scripts/deploy/validate-remote.mjs https://YOUR-VERCEL-DOMAIN
```

Then open:

```text
https://YOUR-VERCEL-DOMAIN/api/health
https://YOUR-VERCEL-DOMAIN/beta-check
```

Expected beta result:
- Supabase configured: pass
- Database: pass
- Storage: pass
- Curriculum count: 50
- Audio placeholders: pass
- Progress write: pass when logged in

## 7. Closed beta checklist

Before inviting testers:
1. Register a test account.
2. Log out.
3. Log in again.
4. Open A0-01.
5. Complete audio, shadowing, exercises, quiz and flashcards.
6. Mark lesson complete.
7. Reload the browser.
8. Confirm progress persists.
9. Log in on another device/browser.
10. Confirm progress syncs.

## 8. Release decision

Ready for closed beta when:
- Production build passes.
- `/api/health` returns `supabaseConfigured: true`.
- `/beta-check` has no failed checks.
- Auth, database, storage and progress writes work with real users.
