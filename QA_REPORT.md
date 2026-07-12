# NederStart QA Report

Sprint: 6 - Quality Hardening  
Date: 2026-06-27  
Scope: Technical audit and hardening of the existing MVP without changing curriculum, UX, design system, or feature scope.

## Summary

NederStart was audited across code quality, routing, TypeScript, ESLint, production build, Supabase readiness, RLS, route protection, progress persistence, audio placeholders, SEO basics, and beta readiness.

The application is technically stable for a closed beta, with the main remaining risks depending on real Supabase deployment, real native audio files, and manual mobile/device QA with testers.

Technical score: 8.4/10  
Beta readiness: Ready for closed beta after remote Supabase configuration and native tester accounts are created.

## Problems Found

1. Dead placeholder components remained from earlier sprints:
   - `apps/web/src/components/audio/audio-placeholder.tsx`
   - `apps/web/src/components/exercise/exercise-placeholder.tsx`
   - `apps/web/src/components/shadowing/shadowing-placeholder.tsx`

2. Audio player could set playback state to playing even if a recorded audio file failed to start.

3. Audio player progress used simulated duration even when recorded audio metadata was available.

4. Audio player progress bar had no explicit accessibility semantics.

5. Progress loading had a small race condition risk: a slower remote progress load could overwrite a newer local learner action.

6. RLS policy for `lesson_progress` was broad and less explicit than ideal for production hardening.

7. Settings upsert needed an explicit insert policy to avoid edge cases if the automatic user settings row was missing.

8. SEO metadata was minimal and did not clearly mark the beta/private state of the platform.

9. Bundle/page size is acceptable for the MVP, but lesson pages are large because they render full curriculum content directly.

10. Supabase remote is not configured in the local environment, so `/api/beta-check` correctly reports warning status locally.

## Problems Corrected

1. Removed unused placeholder components.

2. Hardened `AudioPlayer`:
   - recorded audio now only sets playing state after successful `play()`
   - replay handles play failures gracefully
   - recorded audio metadata updates playback duration
   - progress bar now exposes `role="progressbar"` and ARIA values
   - speed buttons now expose `aria-pressed`

3. Hardened progress loading:
   - local learner actions now win over stale remote progress responses started before the local update

4. Hardened RLS:
   - added explicit insert/update/delete policies for `lesson_progress`
   - added explicit insert/update policies for `settings`
   - update policies now include `with check`

5. Improved basic metadata:
   - title template
   - application name
   - stronger description
   - keywords
   - Open Graph metadata
   - robots set to `noindex,nofollow` while the app is beta/private

## Files Changed

Modified:
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/learning/audio-player.tsx`
- `apps/web/src/lib/learning/progress-store.ts`
- `packages/database/schema/001_initial_schema.sql`

Deleted:
- `apps/web/src/components/audio/audio-placeholder.tsx`
- `apps/web/src/components/exercise/exercise-placeholder.tsx`
- `apps/web/src/components/shadowing/shadowing-placeholder.tsx`

Created:
- `QA_REPORT.md`

## Validation Results

TypeScript:
- Passed with `pnpm typecheck`

ESLint:
- Passed with `pnpm lint`
- No warnings or errors

Production build:
- Passed with `pnpm build`
- 18 static pages generated successfully
- Dynamic lesson and API routes compiled successfully

Route smoke test on `http://localhost:3008`:
- `/api/health` - 200 OK
- `/api/beta-check` - 200 OK, status `warn` expected locally because Supabase env is not configured
- `/beta-check` - 200 OK
- `/dashboard` - 200 OK
- `/levels` - 200 OK
- `/levels/A0/lessons` - 200 OK
- `/levels/A1/lessons` - 200 OK
- `/lessons/A0-01` - 200 OK
- `/lessons/B2-10` - 200 OK
- `/search` - 200 OK
- `/progress` - 200 OK
- `/settings` - 200 OK

Curriculum data:
- Levels: 5
- Lessons: 50
- Audio placeholders: 634
- Vocabulary items: 390
- Phrase items: 244

Search/audit scan:
- No `localStorage` usage found in app source.
- No `@ts-ignore`, `debugger`, `console.log`, `TODO`, or `FIXME` found in app/package source excluding generated curriculum and SQL seed files.
- No references remained to deleted placeholder components.

## Security Review

Good:
- Protected student routes are covered by middleware when `NEXT_PUBLIC_REQUIRE_AUTH=true`.
- Local fallback remains development-friendly.
- Supabase client creation fails closed when env vars are missing.
- User progress, quiz attempts, events, and settings are protected by RLS.
- Storage bucket is explicit and scoped to `native-audio`.

Needs human decision before public launch:
- Audio upload currently allows authenticated users to upload/update files in the `native-audio` bucket. For a public product, this should become admin-only or service-role-only.
- Closed beta can proceed if tester accounts are trusted and the upload API is not exposed in the UI to normal learners.

## Performance Review

Good:
- Shared first-load JS is around 87.3 kB.
- Search page first-load JS is around 104 kB.
- Dashboard, levels, progress, and settings stay within acceptable MVP ranges.
- No unnecessary heavy client libraries were identified.

Watch:
- Lesson pages return large HTML payloads because the current MVP renders full rich lesson content directly. This is acceptable for beta validation, but future optimization should split lesson sections, lazy-load interactive blocks, or move heavy content behind progressive rendering.

## Accessibility Review

Improved:
- Audio playback progress now exposes progressbar semantics.
- Speed controls now expose pressed state.

Recommended manual QA:
- Keyboard-only lesson flow.
- Screen reader pass for lesson player, quiz, exercises, flashcards, and settings.
- Contrast check on warning/success states.

## Mobile Review

Automated HTTP route smoke tests passed for the pages used on mobile.

Manual device QA is still recommended because Playwright is not installed in the project environment and no new dependencies were added during hardening. Test on:
- iPhone-size viewport
- Android-size viewport
- actual mobile browser login/logout
- lesson scrolling with long B2 content
- audio controls on touch
- quiz and flashcard tap targets

## Human Intervention Required

Before closed beta:
1. Configure real Supabase project.
2. Apply schema and full seed remotely.
3. Configure Auth and Storage.
4. Set Vercel environment variables.
5. Run `/api/health` and `/api/beta-check` after deploy.
6. Create 5-10 tester accounts.
7. Test real progress persistence across devices.
8. Upload at least a small sample set of native audio files to validate the audio pipeline.

Before public launch:
1. Restrict native audio upload/update to admin/service role.
2. Add professional QA for Dutch linguistic accuracy.
3. Add full manual accessibility test.
4. Add real device mobile QA.
5. Consider progressive rendering for very long lesson pages.
6. Consider automated E2E tests once the beta flow stabilizes.

## Final Assessment

NederStart is technically solid for a closed beta. The MVP builds cleanly, routes render, curriculum data is complete, progress logic is more robust, RLS is safer, and dead code was removed.

The project should not be considered public-launch-ready until real Supabase deployment, native audio QA, upload permissions, mobile device QA, and linguistic QA are completed.
