# NederStart Pedagogical QA Report

Date: 2026-06-28

Scope: 50 lessons across A0, A1, A2, B1 and B2.

This audit reviews pedagogical quality only. It does not change curriculum, UX, architecture, design or platform functionality.

## Executive Summary

The NederStart course has a coherent A0 to B2 progression, a consistent lesson structure, and a strong audio-first methodology. The sequence generally moves from survival communication and sound awareness into grammar, public-life situations, workplace communication, and advanced professional fluency.

The main pedagogical risk is not the overall curriculum. The risk is assessment specificity: many exercises, quizzes and roleplays follow a reusable pattern and do not always evaluate the exact learning objective of each individual lesson. This is acceptable for a closed beta if testers understand that the product still needs native-teacher and instructional-design QA before public release.

No automatic pedagogical corrections were applied because the identified issues require human teaching judgement, native-speaker validation, or content authoring decisions.

## Audit Criteria

- Progression between lessons
- CEFR level alignment
- Teach-before-test logic
- Exercise alignment with lesson objective
- Vocabulary introduced before use
- Gradual grammar progression
- Difficulty jumps
- Concepts taught too early
- Vocabulary load per lesson
- Exercise load per lesson
- Timing of shadowing
- Coherence of audio usage
- Flashcard alignment
- Quiz alignment
- Roleplay alignment
- Ability of each lesson to fulfil its stated objective

## Quantitative Findings

- Total lessons audited: 50
- Levels audited: A0, A1, A2, B1, B2
- Typical A0 lesson load: 6 vocabulary items, 4 phrases, 5 authored exercises, 5 quiz items, 10 flashcards
- A0-01 load: 12 vocabulary items, 6 phrases, 0 stored authored exercises, 7 quiz items, 18 flashcards
- Typical A1 lesson load: 8 vocabulary items, 5 phrases, 5 exercises, 5 quiz items, 13 flashcards
- Typical A2 lesson load: 8 vocabulary items, 5 phrases, 6 exercises, 5 quiz items, 13 flashcards
- Typical B1 lesson load: 8 vocabulary items, 5 phrases, 6 exercises, 5 quiz items, 13 flashcards
- Typical B2 lesson load: 8 vocabulary items, 5 phrases, 7 exercises, 10 quiz items, 13 flashcards

## Overall Pedagogical Assessment

### Strengths

- The course is not a phrasebook. It uses objectives, grammar, pronunciation, listening, shadowing, exercises, quiz, flashcards and roleplay.
- The A0 to B2 path is logically ordered.
- Audio-first methodology is pedagogically correct for Dutch, especially for learners coming from Portuguese or English.
- Vocabulary load is mostly controlled and consistent after A0-01.
- Pronunciation, rhythm, mouth, tongue and throat guidance appear consistently in the lesson template.
- Shadowing appears from the beginning, which supports listening and oral production early.
- The platform structure can support a serious beta test.

### Main Risks

- Assessment items are often too generic for the specific lesson objective.
- Roleplays are sometimes level-generic instead of lesson-specific.
- A0-01 is heavier than the rest of A0 and has no stored authored exercise records.
- B2 proficiency claims require native audio, human scoring rubrics, and extended production tasks before being presented as validated B2 readiness.
- The content is structurally complete, but some lessons need teacher-level review to confirm that learners can really reach the stated objective.

## Issues Found

### 1. A0-01 - Missing stored authored exercises

- Lesson: A0-01 - Pedir ajuda quando nao entendo
- Problem: The lesson has quiz, flashcards, audio placeholders and roleplay, but the stored `exercises` array is empty.
- Impact: The lesson may still render practice through content blocks, but the structured exercise system cannot validate A0-01 in the same way as the other lessons.
- Suggestion: Add explicit authored exercises for repetition, comprehension, choosing the correct help phrase, and a short oral response.
- Severity: Medium
- Can be corrected automatically? No

### 2. A0-01 - High load for the first absolute-beginner lesson

- Lesson: A0-01 - Pedir ajuda quando nao entendo
- Problem: The first lesson contains more vocabulary and flashcards than the rest of A0.
- Impact: Absolute beginners may feel overloaded before they have sound awareness, alphabet familiarity or basic rhythm.
- Suggestion: Keep the full lesson for beta, but mark part of it as optional review or split practice into shorter steps after teacher review.
- Severity: Medium
- Can be corrected automatically? No

### 3. A0-02 to A0-08 - Quizzes are often methodology-focused

- Lesson: A0-02 to A0-08
- Problem: Several quizzes test general methodology concepts such as listening first, shadowing, mouth position, or avoiding written approximation as the main reference.
- Impact: The quiz may confirm that the learner understands how to study, but not always whether they mastered the specific A0 content such as alphabet sounds, numbers, days, months or basic greetings.
- Suggestion: Add lesson-specific quiz questions for each objective while keeping a smaller number of methodology reminders.
- Severity: Medium
- Can be corrected automatically? No

### 4. A0-02, A0-03, A0-05 - Limited visible vocabulary reuse in phrases

- Lesson: A0-02, A0-03, A0-05
- Problem: Some vocabulary items are introduced but not visibly reused in the main phrase set.
- Impact: Learners may memorize isolated items without enough communicative reinforcement.
- Suggestion: Add or adjust practice prompts so each core vocabulary item is used in a phrase, listening task or micro-dialogue.
- Severity: Medium
- Can be corrected automatically? No

### 5. A0 roleplays - Too generic for some lesson objectives

- Lesson: A0 level
- Problem: Roleplays frequently use broad survival contexts such as shop, public service or telephone rather than the exact objective of the lesson.
- Impact: Roleplay may be useful but may not always prove mastery of the specific lesson.
- Suggestion: Make each roleplay explicitly match the lesson target, for example spelling a name for A0 alphabet or identifying a date for A0 days/months.
- Severity: Medium
- Can be corrected automatically? No

### 6. A1 lessons - Exercises are heavily repetition-based

- Lesson: A1-01 to A1-10
- Problem: Many exercises focus on repeating words, blocks and full phrases, with fewer meaning-based grammar tasks.
- Impact: Learners can improve pronunciation but may not sufficiently demonstrate control of pronouns, articles, sentence order, present tense, zijn and hebben.
- Suggestion: Add structured grammar tasks such as choose de/het/een, reorder the sentence, conjugate the verb, and fill in the correct pronoun.
- Severity: High
- Can be corrected automatically? No

### 7. A1 grammar lessons - Quiz alignment needs strengthening

- Lesson: A1-01 to A1-10
- Problem: Quiz patterns are similar across lessons and do not always directly assess the grammar objective.
- Impact: A learner might pass the quiz without proving they can use articles, present tense or basic word order correctly.
- Suggestion: Add objective-specific quiz items per lesson, especially for de/het/een, zijn, hebben, present tense and basic sentence structure.
- Severity: High
- Can be corrected automatically? No

### 8. A2 situational lessons - Assessment is not specific enough to real-world tasks

- Lesson: A2-03 to A2-10
- Problem: Lessons cover practical domains such as appointments, healthcare, gemeente, BSN, DigiD, housing, phone calls and emails, but some exercises/quizzes remain generic.
- Impact: Learners may understand the language pattern but not be fully tested on the real-world task.
- Suggestion: Add scenario-based assessment: book an appointment, identify a document request, choose the correct reply to a landlord, complete a simple email.
- Severity: High
- Can be corrected automatically? No

### 9. A2 grammar - Negation and question formation need targeted validation

- Lesson: A2-01 and A2-02
- Problem: Question formation and negation are central A2 grammar points, but assessment should more directly test word order, niet/geen, and correct answer formation.
- Impact: Learners may carry fossilized mistakes into B1.
- Suggestion: Add targeted items for yes/no questions, wh-questions, niet position, geen with nouns, and negative replies.
- Severity: High
- Can be corrected automatically? No

### 10. B1 lessons - Reusable quiz pattern under-assesses skill variety

- Lesson: B1-01 to B1-10
- Problem: The same general B1 quiz style appears across lessons with different skill goals such as word order, past tense, future, reading, listening, writing, workplace communication and opinions.
- Impact: A learner may not be tested deeply enough on each separate B1 competence.
- Suggestion: Use separate assessment styles for each skill: sentence correction for word order, narrative completion for past tense, reading questions for B1-04, listening inference for B1-05, and writing rubric for B1-06.
- Severity: High
- Can be corrected automatically? No

### 11. B1 review - Vocabulary integration needs human check

- Lesson: B1-10 - Revisao B1
- Problem: Automated inspection found low direct overlap between stored vocabulary and main phrases.
- Impact: The review may test broad communicative competence but may not recycle enough of the exact B1 vocabulary set.
- Suggestion: Teacher review should verify that the review lesson intentionally integrates B1 vocabulary across reading, listening, speaking and writing.
- Severity: Medium
- Can be corrected automatically? No

### 12. B2 lessons - Advanced assessment needs rubrics

- Lesson: B2-01 to B2-10
- Problem: B2-level tasks require evaluation of clarity, register, argument structure, interaction, fluency and accuracy, but the content does not yet include detailed scoring rubrics.
- Impact: The platform can train B2-oriented skills, but cannot reliably claim independent B2 proficiency without human or rubric-based assessment.
- Suggestion: Add rubrics for presentations, interviews, debates, formal writing, meetings and final fluency.
- Severity: High
- Can be corrected automatically? No

### 13. B2-05 and B2-06 - Limited visible reuse of some vocabulary in phrase set

- Lesson: B2-05 - Entrevistas avancadas; B2-06 - Debate e opiniao
- Problem: Some core vocabulary items appear not to be directly reused in the main phrases.
- Impact: Advanced vocabulary may remain passive instead of becoming active speaking vocabulary.
- Suggestion: Add targeted speaking prompts that force use of interview/debate vocabulary in natural answers.
- Severity: Medium
- Can be corrected automatically? No

### 14. B2-10 - Final fluency objective is ambitious for one lesson

- Lesson: B2-10 - Fluencia final
- Problem: The expected final outcome includes extended professional communication, but one 45-minute lesson cannot by itself validate B2 fluency.
- Impact: Learners may interpret completion as proof of B2 fluency when it should be treated as a final practice checkpoint.
- Suggestion: Present B2-10 as a final integration and self-assessment lesson, then require human speaking/writing review for real B2 validation.
- Severity: High
- Can be corrected automatically? No

### 15. Audio placeholders - Pedagogical validation is incomplete without native recordings

- Lesson: All levels
- Problem: The methodology correctly depends on native audio as the primary reference, but some audio remains placeholder-based.
- Impact: Pronunciation, listening and shadowing quality cannot be fully validated until real native audio is recorded and reviewed.
- Suggestion: Before public beta, prioritize native audio for A0 and A1. Before paid release, record and QA all levels.
- Severity: High
- Can be corrected automatically? No

### 16. Flashcards generally align, but need teacher review for active recall quality

- Lesson: All levels
- Problem: Flashcards mostly match vocabulary and phrases, but many are direct translation cards.
- Impact: Translation cards are useful but may not always train usage, collocation or register.
- Suggestion: Add usage-based cards later, especially for A2-B2, such as cloze cards and situation cards.
- Severity: Low
- Can be corrected automatically? No

### 17. Template consistency may create formulaic learning

- Lesson: All levels
- Problem: Most lessons have nearly identical structural load and flow.
- Impact: Consistency helps navigation, but lessons may feel repetitive if tasks do not vary enough by skill.
- Suggestion: Keep the template, but vary exercise types by objective during human pedagogical review.
- Severity: Medium
- Can be corrected automatically? No

### 18. CEFR claims need controlled beta evidence

- Lesson: All levels
- Problem: The course sequence is CEFR-oriented, but learner outcomes cannot be confirmed until real users complete lessons and are evaluated.
- Impact: The platform should avoid promising guaranteed A0 to B2 transformation before beta data and native-teacher validation.
- Suggestion: Use beta testing to measure completion, retention, listening comprehension, oral performance and task success.
- Severity: High
- Can be corrected automatically? No

## Progression Review

The progression is broadly logical:

1. A0 introduces survival communication, sound awareness, alphabet, pronunciation, numbers and time basics.
2. A1 introduces pronouns, articles, simple sentence structure, present tense, zijn, hebben, common verbs and everyday contexts.
3. A2 moves into functional situations: questions, negation, appointments, healthcare, municipality, BSN/DigiD, housing, work, phone calls and emails.
4. B1 develops intermediate grammar, reading, listening, writing, workplace communication, opinions and culture.
5. B2 targets formal communication, meetings, presentations, interviews, debate, advanced reading/listening/writing and final fluency integration.

No major curriculum-order failure was found. The progression is suitable for closed beta, with the caveat that assessments need to become more lesson-specific before public release.

## CEFR Alignment Review

- A0: Appropriate for absolute beginners, but A0-01 may be heavy.
- A1: Appropriate topics, but grammar assessment needs stronger objective-specific validation.
- A2: Appropriate real-life domains, but situational assessment needs strengthening.
- B1: Appropriate intermediate domains, but skill-specific assessment should be deeper.
- B2: Appropriate advanced domains, but B2 outcome claims require rubrics, native audio and human review.

## Automatic Corrections

No automatic corrections were applied.

Reason: The issues found are not obvious safe edits. They require decisions about lesson design, assessment strategy, native-speaker judgement, or future content authoring. Automatically changing these could accidentally alter curriculum intent or reduce quality.

## Human Review Required

Human review is recommended for all 18 issues above.

Priority order:

1. Native audio recording and QA for A0-A1.
2. Add lesson-specific quizzes for A1 and A2.
3. Add scenario-based exercises for A2.
4. Add rubrics for B1-B2 writing and speaking.
5. Review B2 outcome language before public marketing.
6. Review A0-01 load and missing structured exercises.

## Beta Readiness Conclusion

The course is ready for a closed beta from a platform and structured-content perspective, provided the beta is positioned as a learning-product test rather than a guaranteed CEFR certification path.

Recommended beta focus:

- Can beginners understand the lesson flow?
- Do learners know what to do first: listen, repeat, shadow, then answer?
- Can learners complete A0-A1 without teacher help?
- Which exercises feel too generic?
- Which quizzes fail to test the actual lesson?
- Does native audio availability limit learning?
- Do users feel progression from lesson to lesson?

## Final Counts

- Problems found: 18
- Automatic corrections made: 0
- Items marked for human review: 18
- Files changed by this audit: `PEDAGOGICAL_QA_REPORT.md`

