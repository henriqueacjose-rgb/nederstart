# NederStart Linguistic QA Report

Date: 2026-06-27  
Scope: automatic linguistic QA of the 50 A0-B2 lessons in `packages/content/generated/nederstart-content.json`, with synchronized updates in `packages/database/seeds/002_seed_full_curriculum.sql`.

## Summary

Problems found: 24  
Automatic safe corrections made: 17  
Items marked for human/native-teacher review: 7

This audit focused on obvious, mechanically safe linguistic issues: incorrect or unnatural Dutch, overly literal EN/PT translations, inconsistent meaning across NL/PT/EN, and wording that could confuse learners. Items that depend on regional Dutch usage, register, or native-speaker preference were not corrected automatically and are marked for review.

## Corrected Automatically

| Lesson/file | Problem found | Current text before QA | Suggested/corrected text | Severity | Native teacher needed? |
|---|---|---|---|---|---|
| A0-01 | Reduced form used phonetic English-like note instead of a real phrase variant. | `helpen -> helpuh` | `Kunt u me helpen?` | medium | no |
| A0-03 | PT translation used informal European Portuguese imperative inconsistent with the neutral course voice. | `Ouve e repete.` | `Ouça e repita.` | low | no |
| A0-03 | Natural-form typo merged verb and pronoun. | `Hoe zegtu dat?` | `Hoe zegt u dat?` | high | no |
| A0-04 | Vocabulary translation for `ziens` was misleading as a standalone item. | `ver-nos / ate ver` / `seeing` | `ver, usado em tot ziens` / `seeing, used in tot ziens` | medium | no |
| A0-05 | Dutch age phrase was incomplete. | `Ik ben dertig jaar.` | `Ik ben dertig jaar oud.` | high | no |
| A1-09 | EN translation was too literal and implied excessive lateness. | `The bus is too late.` | `The bus is late.` | medium | no |
| A2-03 | PT translation was unnatural/repetitive. | `remarcar a marcacao` | `remarcar a consulta/o compromisso` | medium | no |
| A2-05 | EN/PT translation of registration visit was too literal. | `I come for my registration.` / `Venho para a minha inscricao.` | `I am here for my registration.` / `Venho tratar da minha inscricao.` | medium | no |
| A2-05 | Dutch request was understandable but less natural for asking for an explanation. | `Kunt u mij uitleg geven?` | `Kunt u mij dit uitleggen?` | medium | no |
| A2-07 | Dutch repair question was elliptical/unnatural for learners. | `Wanneer kan de reparatie?` | `Wanneer kan de reparatie plaatsvinden?` | high | no |
| A2-08 | PT translation was too colloquial and unclear for a course. | `Isso da, sem problema.` | `Isso e possivel, sem problema.` | low | no |
| A2-09 | EN phone phrase was less standard. | `Who am I speaking with?` | `Who am I speaking to?` | low | no |
| B1-01 | Dutch phrase sounded translated and unnatural. | `Ik ben later, omdat de trein vertraging had.` | `Ik kom later, omdat de trein vertraging had.` | high | no |
| B1-04 | EN translation was unnatural. | `Send a copy of your document along.` | `Send a copy of your document as well.` | low | no |
| B2-08 | EN translation was unidiomatic. | `We had agreed that differently.` | `We agreed on something different.` | medium | no |
| B2-09 | Formal Dutch phrase was understandable but less idiomatic than the safer standard wording. | `Laat u mij weten of u akkoord bent?` | `Kunt u mij laten weten of u akkoord gaat?` | medium | no |
| B2-10 | EN translation of `kern` was too literal. | `I understand the core, even if I do not understand every word.` | `I understand the main point, even if I do not understand every word.` | low | no |

## Marked For Human/Native Review

| Lesson/file | Problem found | Current text | Suggested direction | Severity | Native teacher needed? |
|---|---|---|---|---|---|
| A0-04 | `ziens` appears as a standalone vocabulary item, but learners mainly encounter it in the fixed expression `Tot ziens`. | `ziens` | Consider replacing the vocabulary item with `tot ziens` in a future content revision. | medium | yes |
| A1-09 | Platform phrase may need a more natural Dutch station wording depending on context. | `Op welk perron?` | Consider `Vanaf welk perron?` for departures. | low | yes |
| B1-09 | Culture phrase is understandable but may sound translated. | `Iedereen moet de regels respecteren.` | Consider `Iedereen moet zich aan de regels houden.` if the lesson aims for natural everyday Dutch. | medium | yes |
| B2-02/B2-09 | Formal written Dutch needs native register QA before public launch. | formal email phrases | Review tone: polite, not too stiff, suitable for municipality/workplace contexts. | medium | yes |
| B2 levels | Advanced speaking/writing roleplays are structurally useful but may be too generic. | B2 roleplay prompts | Native/professional review should add more realistic Dutch workplace wording. | medium | yes |
| All levels | Quiz/exercise answer validation is partially generated at runtime from vocabulary/phrases rather than stored as full answer keys in the content file. | interactive exercise/quiz models | Human QA should test correct/incorrect answer behavior lesson by lesson. | high | yes |
| All levels | Native audio is still placeholder-based. Some corrected phrases now require matching final audio filenames/transcripts during recording. | audio placeholders | Audio production team must confirm filenames/transcripts before recording/upload. | high | yes |

## Validation Notes

- The JSON content file remains valid JSON after corrections.
- The seed file was updated with the same textual corrections so remote Supabase deployments receive the corrected curriculum.
- Corrections were limited to obvious linguistic issues and consistency updates.
- No React code, UX, schema, curriculum order, or new lessons were changed.

## Files Revised

- `packages/content/generated/nederstart-content.json`
- `packages/database/seeds/002_seed_full_curriculum.sql`

## Recommendation Before Closed Beta

Closed beta can proceed after these automatic fixes, but a native Dutch teacher should review at least:

1. all A0/A1 survival phrases;
2. all B2 formal/professional phrases;
3. roleplays;
4. audio scripts before recording;
5. interactive exercise answers during real testing.
