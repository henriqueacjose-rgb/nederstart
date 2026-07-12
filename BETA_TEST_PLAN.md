# NederStart Closed Beta Test Plan

## Objective

Validate whether NederStart is ready for real learners before public launch.

The beta should confirm:
- users can register, log in and return later
- progress persists across sessions/devices
- A0 lessons are understandable for beginners
- lesson pages feel like an audio-first app, not a PDF
- audio placeholders and future audio structure are clear
- exercises, quiz, flashcards and shadowing are usable on mobile

## Tester profile

Recruit 5-10 testers:
- Portuguese speakers living in the Netherlands
- English speakers living in the Netherlands
- at least 3 true beginners
- at least 2 people with some Dutch experience
- at least 3 mobile-first users

## Tester tasks

Each tester should:
1. Create an account.
2. Choose base language: Portuguese or English.
3. Open dashboard.
4. Open A0-01.
5. Confirm vocabulary cards show a visible `Play audio` button.
6. Confirm phrase cards show `Slow` and `Natural`.
7. Open `Ver detalhes` on one word or phrase and confirm the full explanation appears.
8. Use audio player.
9. Complete shadowing.
10. Complete exercises.
11. Complete quiz.
12. Use flashcards.
13. Mark lesson complete.
14. Log out.
15. Log in again.
16. Confirm progress is still saved.
17. Search for one word.
18. Change settings.
19. Test on mobile.

## Feedback questions

Ask each tester:
1. Did you understand what to do without help?
2. Was the lesson too easy, too hard or right?
3. Did the pronunciation guidance help?
4. Was shadowing clear?
5. Were exercises useful?
6. Did the quiz feel fair?
7. Did progress feel reliable?
8. Was the mobile experience comfortable?
9. Did the lesson page feel like an app or like a long document?
10. Were the `Play audio`, `Slow`, `Natural` and `Ver detalhes` controls clear?
11. What made you confused?
12. Would you continue to lesson A0-02?

## Bugs to observe

Track:
- login/register failures
- password recovery failures
- lesson pages not loading
- lesson page still feeling like a PDF/long document
- progress not saving
- progress not syncing after logout/login
- mobile layout overlap
- buttons too small on phone
- `Play audio`, `Slow`, `Natural` or `Ver detalhes` not visible enough
- audio controls confusing
- search not finding obvious vocabulary
- settings not saving

## Success criteria

Closed beta is successful if:
- 80% of testers complete A0-01 without support
- 80% report the interface is clear
- 70% say they would continue learning
- no critical auth/progress bugs remain
- mobile experience has no blocking issues

## Exit criteria

Move from closed beta to wider beta only after:
- all P0/P1 bugs are fixed
- Supabase progress is stable
- dashboard and progress pages reflect real data
- at least 5 testers successfully complete A0-01
- feedback confirms the product feels serious and useful
