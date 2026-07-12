# Founder Deploy Checklist - NederStart

Use this checklist step by step. Do not skip checks.

## 1. Supabase project

- [ ] Go to `https://supabase.com`.
- [ ] Create a new project.
- [ ] Choose a project name, for example `nederstart-beta`.
- [ ] Save the database password somewhere safe.
- [ ] Wait until Supabase finishes creating the project.

## 2. Supabase URL and anon key

- [ ] Open the Supabase project.
- [ ] Go to `Project Settings`.
- [ ] Go to `API`.
- [ ] Copy `Project URL`.
- [ ] Save it as `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Copy `anon public` key.
- [ ] Save it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Copy `service_role` key.
- [ ] Save it as `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Never share the `service_role` key publicly.

## 3. Apply database schema

- [ ] In Supabase, go to `SQL Editor`.
- [ ] Open this file in the project:
  `packages/database/schema/001_initial_schema.sql`
- [ ] Copy all content.
- [ ] Paste it into Supabase SQL Editor.
- [ ] Click `Run`.
- [ ] Confirm there are no SQL errors.

## 4. Apply full curriculum seed

- [ ] In Supabase, open a new SQL query.
- [ ] Open this file in the project:
  `packages/database/seeds/002_seed_full_curriculum.sql`
- [ ] Copy all content.
- [ ] Paste it into Supabase SQL Editor.
- [ ] Click `Run`.
- [ ] Wait until it finishes.
- [ ] Confirm there are no SQL errors.

## 5. Confirm tables exist

- [ ] Go to `Table Editor`.
- [ ] Confirm these tables exist:
  - [ ] `courses`
  - [ ] `levels`
  - [ ] `lessons`
  - [ ] `lesson_content_blocks`
  - [ ] `vocabulary_items`
  - [ ] `phrases`
  - [ ] `audio_assets`
  - [ ] `lesson_progress`
  - [ ] `settings`

## 6. Confirm 50 lessons

- [ ] Go to `Table Editor`.
- [ ] Open table `lessons`.
- [ ] Confirm there are `50` rows.
- [ ] Confirm you can see lessons from:
  - [ ] `A0`
  - [ ] `A1`
  - [ ] `A2`
  - [ ] `B1`
  - [ ] `B2`

## 7. Confirm audio bucket

- [ ] Go to `Storage`.
- [ ] Confirm bucket `native-audio` exists.
- [ ] Open bucket `native-audio`.
- [ ] Confirm it is available.
- [ ] If it does not exist, rerun `001_initial_schema.sql`.

## 8. Configure Auth

- [ ] Go to `Authentication`.
- [ ] Go to `Providers`.
- [ ] Enable `Email`.
- [ ] Enable email/password signups for beta testers.
- [ ] Go to `URL Configuration`.
- [ ] Set `Site URL` to your Vercel URL after deploy.
- [ ] Add redirect URL:
  `https://YOUR-VERCEL-DOMAIN/login`
- [ ] Add local redirect URL:
  `http://localhost:3000/login`

## 9. Create Vercel project

- [ ] Go to `https://vercel.com`.
- [ ] Create a new project.
- [ ] Import the NederStart repository/project.
- [ ] Set root directory to:
  `nederstart`
- [ ] Confirm framework is `Next.js`.

## 10. Add Vercel environment variables

Add these in Vercel Project Settings > Environment Variables:

- [ ] `NEXT_PUBLIC_APP_ENV`
  - Value: `production`
- [ ] `NEXT_PUBLIC_APP_URL`
  - Value: `https://YOUR-VERCEL-DOMAIN`
- [ ] `NEXT_PUBLIC_REQUIRE_AUTH`
  - Value: `true`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - Value: your Supabase Project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Value: your Supabase anon public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - Value: your Supabase service role key
- [ ] `NEXT_PUBLIC_AUDIO_BUCKET`
  - Value: `native-audio`

## 11. Beta values to use

- [ ] Use `NEXT_PUBLIC_APP_ENV=production`.
- [ ] Use `NEXT_PUBLIC_REQUIRE_AUTH=true`.
- [ ] Use `NEXT_PUBLIC_AUDIO_BUCKET=native-audio`.
- [ ] Use the real Supabase remote URL.
- [ ] Use the real Supabase anon key.
- [ ] Use the real Supabase service role key.

## 12. Deploy

- [ ] In Vercel, click `Deploy`.
- [ ] Wait for build to finish.
- [ ] Confirm deploy status is successful.
- [ ] Open the deployed URL.

## 13. Open health check

- [ ] Open:
  `https://YOUR-VERCEL-DOMAIN/api/health`
- [ ] Confirm `status` is `ok`.
- [ ] Confirm `phase` is `deploy-ready`.
- [ ] Confirm `lessonUx` is `audio-first-template`.
- [ ] Confirm `supabaseConfigured` is `true`.
- [ ] Confirm `lessonCount` is `50`.

## 14. Open beta check

- [ ] Open:
  `https://YOUR-VERCEL-DOMAIN/beta-check`
- [ ] Click `Run again`.
- [ ] Confirm there are no failed checks.

## 15. Interpret beta-check status

- [ ] `pass` means the check is good.
- [ ] `warn` means something needs attention but may be expected.
- [ ] `fail` means do not start beta yet.

Common expected warning:

- [ ] `progress-write-test` can show warning if you are not logged in.
- [ ] Log in with a test account and run `/beta-check` again.

## 16. Create test account

- [ ] Open deployed app.
- [ ] Go to `/register`.
- [ ] Create a test user.
- [ ] Use a real email you can access.
- [ ] Choose base language: Portuguese or English.
- [ ] Confirm registration succeeds.

## 17. Test login

- [ ] Log out.
- [ ] Go to `/login`.
- [ ] Log in with the test account.
- [ ] Confirm dashboard opens.

## 18. Test progress

- [ ] Open lesson `A0-01`.
- [ ] Confirm vocabulary cards show `Play audio`.
- [ ] Confirm phrase cards show `Slow` and `Natural`.
- [ ] Confirm long explanations are hidden behind `Ver detalhes`.
- [ ] Use the audio player.
- [ ] Complete shadowing.
- [ ] Complete exercises.
- [ ] Complete quiz.
- [ ] Use flashcards.
- [ ] Click `Mark lesson complete`.
- [ ] Open `/progress`.
- [ ] Confirm progress changed.

## 19. Test persistent progress

- [ ] Log out.
- [ ] Log in again.
- [ ] Open `/dashboard`.
- [ ] Confirm progress is still there.
- [ ] Open `/progress`.
- [ ] Confirm completed lesson is still saved.

## 20. Test mobile

- [ ] Open the deployed app on your phone.
- [ ] Log in.
- [ ] Open `A0-01`.
- [ ] Confirm buttons are easy to tap.
- [ ] Confirm text does not overlap.
- [ ] Complete one interaction.
- [ ] Open `/progress`.
- [ ] Confirm progress updates.

## 21. If something fails

- [ ] If deploy fails, check Vercel build logs.
- [ ] If Supabase is not configured, check Vercel env vars.
- [ ] If login fails, check Supabase Auth settings.
- [ ] If lessons are missing, rerun `002_seed_full_curriculum.sql`.
- [ ] If tables are missing, rerun `001_initial_schema.sql`.
- [ ] If audio bucket is missing, rerun `001_initial_schema.sql`.
- [ ] If progress does not save, check RLS policies and confirm user is logged in.
- [ ] If `/beta-check` has `fail`, fix that item before inviting testers.

## 22. Final beta approval

- [ ] `/api/health` is green.
- [ ] `/beta-check` has no failed checks.
- [ ] Login works.
- [ ] Logout works.
- [ ] Progress saves.
- [ ] Progress persists after logout/login.
- [ ] Mobile works.
- [ ] 50 lessons are visible.
- [ ] Search works.
- [ ] Settings page works.

When all checks are green, NederStart is ready for closed beta.
