import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../../..");
const sourceRoot = path.join(root, "outputs/nederstart-course/lessons");
const contentOutDir = path.join(root, "nederstart/packages/content/generated");
const dbSeedDir = path.join(root, "nederstart/packages/database/seeds");
const jsonOut = path.join(contentOutDir, "nederstart-content.json");
const sqlOut = path.join(dbSeedDir, "002_seed_full_curriculum.sql");

fs.mkdirSync(contentOutDir, { recursive: true });
fs.mkdirSync(dbSeedDir, { recursive: true });

function slug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readLessons(levelCode) {
  const dir = path.join(sourceRoot, levelCode);
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => {
      const fullPath = path.join(dir, file);
      return { file, fullPath, markdown: fs.readFileSync(fullPath, "utf8") };
    });
}

function extractTitle(markdown) {
  const match = markdown.match(/^#\s+([A-Z0-9-]+)\s+(?:-|—|â€”)\s+(.+)$/m);
  if (!match) throw new Error("Missing title");
  return { code: match[1].trim(), title: match[2].trim() };
}

function extractTitleSafe(markdown, file) {
  try {
    return extractTitle(markdown);
  } catch {
    const firstHeading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";
    const headingMatch = firstHeading.match(/^([A-Z0-9-]+)\s+(.+)$/);
    if (headingMatch) {
      const title = headingMatch[2]
        .replace(/^[-\u2013\u2014]+/, "")
        .replace(/^a+[-\u20ac\u201d]+/i, "")
        .trim();
      return { code: headingMatch[1].trim(), title: title || headingMatch[1].trim() };
    }

    const filenameMatch = file.match(/^([A-Z0-9-]+)-(.+)\.md$/);
    if (!filenameMatch) throw new Error(`Missing title in ${file}`);
    const title = filenameMatch[2]
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return { code: filenameMatch[1], title };
  }
}

function extractSections(markdown, lessonCode) {
  const regex = /^##\s+(.+)$/gm;
  const matches = [...markdown.matchAll(regex)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    const rawTitle = match[1].trim();
    const cleanTitle = rawTitle.replace(/^\d+\.\s*/, "");
    return {
      id: `${lessonCode}-block-${String(index + 1).padStart(2, "0")}`,
      lessonCode,
      type: slug(cleanTitle),
      title: cleanTitle,
      order: index + 1,
      body: markdown.slice(start, end).trim()
    };
  });
}

function sectionBody(blocks, includes) {
  const found = blocks.find((block) => includes.some((term) => block.title.toLowerCase().includes(term)));
  return found?.body ?? "";
}

function combinedSectionBody(blocks, includes) {
  return blocks
    .filter((block) => includes.some((term) => block.title.toLowerCase().includes(term)))
    .map((block) => block.body)
    .filter(Boolean)
    .join("\n\n");
}

function firstBullet(text) {
  return text.match(/^-\s+(.+)$/m)?.[1]?.trim() ?? "";
}

function fieldValue(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}:\\s*(.+)`));
  return match?.[1]?.replace(/\s{2,}.*/, "").trim() ?? "";
}

function fencedAfter(text, label) {
  const index = text.indexOf(label);
  if (index === -1) return "";
  const rest = text.slice(index);
  return rest.match(/```(?:text)?\s*([\s\S]*?)```/)?.[1]?.trim() ?? "";
}

function paragraphAfter(text, label) {
  const index = text.indexOf(label);
  if (index === -1) return "";
  const rest = text.slice(index + label.length);
  return rest.split(/\n\s*\n/).find((part) => part.trim())?.trim() ?? "";
}

function parseVocabulary(markdown, lessonCode) {
  const chunks = markdown.split(/### Palavra \d+/).slice(1);
  return chunks.map((chunk, index) => {
    const textNl = fieldValue(chunk, "Palavra").replaceAll("`", "");
    const translationPt = fieldValue(chunk, "Traducao PT");
    const translationEn = fieldValue(chunk, "Traducao EN");
    const audioPath = fieldValue(chunk, "Audio nativo").replaceAll("`", "");
    return {
      id: `${lessonCode}-vocab-${String(index + 1).padStart(2, "0")}`,
      lessonCode,
      textNl,
      translationPt,
      translationEn,
      audioPath,
      explanation: paragraphAfter(chunk, "Explicacao fisica:"),
      example: fencedAfter(chunk, "Exemplo em contexto:"),
      order: index + 1
    };
  });
}

function parsePhrases(markdown, lessonCode) {
  const chunks = markdown.split(/### Frase \d+/).slice(1);
  return chunks.map((chunk, index) => {
    const textNl = fieldValue(chunk, "Frase").replaceAll("`", "");
    const translationPt = fieldValue(chunk, "Traducao PT");
    const translationEn = fieldValue(chunk, "Traducao EN");
    const audioPath = fieldValue(chunk, "Audio nativo").replaceAll("`", "");
    return {
      id: `${lessonCode}-phrase-${String(index + 1).padStart(2, "0")}`,
      lessonCode,
      textNl,
      translationPt,
      translationEn,
      audioPath,
      soundBlocks: fencedAfter(chunk, "Blocos sonoros:"),
      slowForm: fencedAfter(chunk, "Forma lenta:"),
      naturalForm: fencedAfter(chunk, "Forma natural:"),
      reducedForm: fencedAfter(chunk, "Forma reduzida:"),
      explanation: paragraphAfter(chunk, "Explicacao fisica:"),
      order: index + 1
    };
  });
}

function parseNumberedPrompts(body, lessonCode, prefix, type) {
  return [...body.matchAll(/^\d+\.\s+(.+)$/gm)].map((match, index) => ({
    id: `${lessonCode}-${prefix}-${String(index + 1).padStart(2, "0")}`,
    lessonCode,
    type,
    prompt: match[1].trim(),
    order: index + 1
  }));
}

function toAudioPlaceholders(lessonCode, vocabulary, phrases) {
  const levelCode = lessonCode.split("-")[0];
  const includeBetaAudioSet = levelCode === "A0" || levelCode === "A1";
  const wordAudio = vocabulary
    .filter((item) => item.audioPath)
    .map((item) => ({
      id: `${item.id}-audio`,
      lessonCode,
      ownerId: item.id,
      type: "word",
      speed: "natural",
      transcriptNl: item.textNl,
      fileUrl: item.audioPath,
      status: "placeholder"
    }));
  const phraseAudio = phrases
    .filter((item) => item.audioPath)
    .flatMap((item) => {
      const natural = {
        id: includeBetaAudioSet ? `${item.id}-audio-natural` : `${item.id}-audio`,
        lessonCode,
        ownerId: item.id,
        type: "phrase",
        speed: "natural",
        transcriptNl: item.textNl,
        fileUrl: item.audioPath,
        status: "placeholder"
      };
      if (!includeBetaAudioSet) return [natural];
      return [
        {
          id: `${item.id}-audio-slow`,
          lessonCode,
          ownerId: item.id,
          type: "phrase",
          speed: "slow",
          transcriptNl: item.slowForm || item.textNl,
          fileUrl: item.audioPath.replace(".native.nl.mp3", ".slow.native.nl.mp3"),
          status: "placeholder"
        },
        natural
      ];
    });
  return [...wordAudio, ...phraseAudio];
}

function flashcardsFrom(lessonCode, vocabulary, phrases) {
  const vocabCards = vocabulary.map((item, index) => ({
    id: `${lessonCode}-flashcard-v-${String(index + 1).padStart(2, "0")}`,
    lessonCode,
    front: item.textNl,
    back: `${item.translationPt} / ${item.translationEn}`,
    audioPath: item.audioPath,
    order: index + 1
  }));
  const phraseCards = phrases.map((item, index) => ({
    id: `${lessonCode}-flashcard-p-${String(index + 1).padStart(2, "0")}`,
    lessonCode,
    front: item.textNl,
    back: `${item.translationPt} / ${item.translationEn}`,
    audioPath: item.audioPath,
    order: vocabulary.length + index + 1
  }));
  return [...vocabCards, ...phraseCards];
}

function buildLesson({ markdown, file }, order) {
  const { code, title } = extractTitleSafe(markdown, file);
  const levelCode = code.split("-")[0];
  const blocks = extractSections(markdown, code);
  const objective = firstBullet(sectionBody(blocks, ["objetivos", "objective"])) || title;
  const vocabulary = parseVocabulary(markdown, code);
  const phrases = parsePhrases(markdown, code);
  const exerciseBody =
    code === "A0-01"
      ? combinedSectionBody(blocks, ["exercicios escritos", "exercicios orais"])
      : sectionBody(blocks, ["exercicios escritos", "exercises", "exercicios"]);
  const quizBody = sectionBody(blocks, ["quiz"]);
  const roleplayBody = sectionBody(blocks, ["roleplay"]);
  const exercises = parseNumberedPrompts(exerciseBody, code, "exercise", "written");
  const quizQuestions = parseNumberedPrompts(quizBody, code, "quiz", "quiz");
  const roleplays = roleplayBody
    ? [
        {
          id: `${code}-roleplay-01`,
          lessonCode: code,
          title: `Roleplay ${code}`,
          scenario: roleplayBody,
          order: 1
        }
      ]
    : [];

  return {
    code,
    levelCode,
    title,
    objective,
    order,
    sourceFile: file,
    estimatedMinutes: levelCode === "A0" ? 35 : 45,
    markdown,
    contentBlocks: blocks,
    vocabulary,
    phrases,
    exercises,
    quizQuestions,
    flashcards: flashcardsFrom(code, vocabulary, phrases),
    roleplays,
    audioPlaceholders: toAudioPlaceholders(code, vocabulary, phrases)
  };
}

const levelCodes = ["A0", "A1", "A2", "B1", "B2"];
const lessonsByLevel = Object.fromEntries(
  levelCodes.map((levelCode) => [levelCode, readLessons(levelCode).map(buildLesson)])
);
const lessons = levelCodes.flatMap((levelCode) => lessonsByLevel[levelCode]);

const course = {
  code: "nederstart-dutch",
  title: "NederStart Dutch",
  targetLanguage: "nl",
  status: "beta-ready"
};

const levels = [
  {
    code: "A0",
    title: "A0 - Start from zero",
    description: "Sounds, alphabet, survival phrases and first confidence.",
    order: 1,
    lessonCount: lessonsByLevel.A0.length,
    status: "available"
  },
  {
    code: "A1",
    title: "A1 - Daily basics",
    description: "Personal language, simple grammar, home, shopping and transport.",
    order: 2,
    lessonCount: lessonsByLevel.A1.length,
    status: "available"
  },
  {
    code: "A2",
    title: "A2 - Real life situations",
    description: "Appointments, healthcare, gemeente, BSN, DigiD and housing.",
    order: 3,
    lessonCount: lessonsByLevel.A2.length,
    status: "available"
  },
  {
    code: "B1",
    title: "B1 - Independent speaker",
    description: "Workplace communication, reading, writing and opinions.",
    order: 4,
    lessonCount: lessonsByLevel.B1.length,
    status: "available"
  },
  {
    code: "B2",
    title: "B2 - Professional fluency",
    description: "Formal communication, meetings, interviews and advanced listening.",
    order: 5,
    lessonCount: lessonsByLevel.B2.length,
    status: "available"
  }
];

const payload = {
  generatedAt: new Date().toISOString(),
  source: "outputs/nederstart-course/lessons/A0-B2",
  course,
  levels,
  lessons
};

fs.writeFileSync(jsonOut, `${JSON.stringify(payload, null, 2)}\n`);

function sqlText(value) {
  return `'${String(value ?? "").replaceAll("'", "''")}'`;
}

function sqlJson(value) {
  return `${sqlText(JSON.stringify(value))}::jsonb`;
}

const sqlLines = [
  "-- Generated beta seed for Sprint 4.",
  "-- Source of truth for the MVP mock is packages/content/generated/nederstart-content.json.",
  "-- This seed keeps Supabase/PostgreSQL aligned for later local deployment.",
  "",
  "insert into languages(code, name, direction_type, active) values",
  "  ('pt', 'Portuguese', 'source', true),",
  "  ('en', 'English', 'source', true),",
  "  ('nl', 'Dutch', 'target', true)",
  "on conflict (code) do update set name = excluded.name, active = excluded.active;",
  "",
  "truncate table progress_events, quiz_attempts, lesson_progress, audio_assets, roleplays, flashcards, quiz_questions, quizzes, exercises, phrases, vocabulary_items, lesson_content_blocks, lessons, levels, courses restart identity cascade;",
  "",
  "insert into courses(code, title, target_language_code, status)",
  `values (${sqlText(course.code)}, ${sqlText(course.title)}, 'nl', 'published')`,
  "on conflict (code) do update set title = excluded.title, status = excluded.status;",
  ""
];

levels.forEach((level) => {
  sqlLines.push(
    "insert into levels(course_id, code, title, description, order_index, status)",
    `select c.id, ${sqlText(level.code)}, ${sqlText(level.title)}, ${sqlText(level.description)}, ${level.order}, ${sqlText(level.status === "available" ? "published" : "draft")}`,
    `from courses c where c.code = ${sqlText(course.code)}`,
    "on conflict (course_id, code) do update set title = excluded.title, description = excluded.description, order_index = excluded.order_index, status = excluded.status;",
    ""
  );
});

lessons.forEach((lesson) => {
  sqlLines.push(
    "insert into lessons(level_id, code, title, objective, order_index, status, estimated_minutes)",
    `select lv.id, ${sqlText(lesson.code)}, ${sqlText(lesson.title)}, ${sqlText(lesson.objective)}, ${lesson.order}, 'published', ${lesson.estimatedMinutes}`,
    "from levels lv",
    `join courses c on c.id = lv.course_id where c.code = ${sqlText(course.code)} and lv.code = ${sqlText(lesson.levelCode)}`,
    "on conflict (code) do update set title = excluded.title, objective = excluded.objective, order_index = excluded.order_index, status = excluded.status, estimated_minutes = excluded.estimated_minutes;",
    ""
  );

  lesson.contentBlocks.forEach((block) => {
    sqlLines.push(
      "insert into lesson_content_blocks(lesson_id, block_type, order_index, content_json, source_language_code, target_language_code)",
      `select l.id, ${sqlText(block.type)}, ${block.order}, ${sqlJson({ title: block.title, body: block.body })}, 'pt', 'nl' from lessons l where l.code = ${sqlText(lesson.code)};`
    );
  });

  lesson.vocabulary.forEach((item) => {
    sqlLines.push(
      "insert into vocabulary_items(lesson_id, text_nl, translation_pt, translation_en, pronunciation_guidance, example_sentence, order_index)",
      `select l.id, ${sqlText(item.textNl)}, ${sqlText(item.translationPt)}, ${sqlText(item.translationEn)}, ${sqlText(item.explanation)}, ${sqlText(item.example)}, ${item.order} from lessons l where l.code = ${sqlText(lesson.code)};`
    );
  });

  lesson.phrases.forEach((item) => {
    sqlLines.push(
      "insert into phrases(lesson_id, text_nl, translation_pt, translation_en, sound_blocks, slow_form, natural_form, reduced_form, pronunciation_guidance, order_index)",
      `select l.id, ${sqlText(item.textNl)}, ${sqlText(item.translationPt)}, ${sqlText(item.translationEn)}, ${sqlText(item.soundBlocks)}, ${sqlText(item.slowForm)}, ${sqlText(item.naturalForm)}, ${sqlText(item.reducedForm)}, ${sqlText(item.explanation)}, ${item.order} from lessons l where l.code = ${sqlText(lesson.code)};`
    );
  });

  lesson.exercises.forEach((item) => {
    sqlLines.push(
      "insert into exercises(lesson_id, type, prompt_json, order_index, status)",
      `select l.id, 'short_answer', ${sqlJson({ prompt: item.prompt, sourceType: item.type })}, ${item.order}, 'published' from lessons l where l.code = ${sqlText(lesson.code)};`
    );
  });

  sqlLines.push(
    "insert into quizzes(lesson_id, title, pass_score, status)",
    `select l.id, ${sqlText(`${lesson.code} quiz`)}, 80, 'published' from lessons l where l.code = ${sqlText(lesson.code)};`
  );

  lesson.quizQuestions.forEach((item) => {
    sqlLines.push(
      "insert into quiz_questions(quiz_id, type, prompt_json, order_index)",
      `select q.id, 'short_answer', ${sqlJson({ prompt: item.prompt })}, ${item.order} from quizzes q join lessons l on l.id = q.lesson_id where l.code = ${sqlText(lesson.code)} and q.title = ${sqlText(`${lesson.code} quiz`)};`
    );
  });

  lesson.flashcards.forEach((item) => {
    sqlLines.push(
      "insert into flashcards(lesson_id, front_json, back_json, order_index)",
      `select l.id, ${sqlJson({ text: item.front })}, ${sqlJson({ text: item.back })}, ${item.order} from lessons l where l.code = ${sqlText(lesson.code)};`
    );
  });

  lesson.roleplays.forEach((item) => {
    sqlLines.push(
      "insert into roleplays(lesson_id, title, scenario_json, order_index)",
      `select l.id, ${sqlText(item.title)}, ${sqlJson({ scenario: item.scenario })}, ${item.order} from lessons l where l.code = ${sqlText(lesson.code)};`
    );
  });

  lesson.audioPlaceholders.forEach((item) => {
    sqlLines.push(
      "insert into audio_assets(lesson_id, type, speed, file_url, transcript_nl, status)",
      `select l.id, ${sqlText(item.type)}, ${sqlText(item.speed)}, ${sqlText(item.fileUrl)}, ${sqlText(item.transcriptNl)}, 'draft' from lessons l where l.code = ${sqlText(lesson.code)};`
    );
  });

  sqlLines.push("");
});

sqlLines.push(
  `-- A0-B2 lessons imported: ${lessons.length}`,
  `-- Vocabulary items: ${lessons.reduce((sum, lesson) => sum + lesson.vocabulary.length, 0)}`,
  `-- Phrases: ${lessons.reduce((sum, lesson) => sum + lesson.phrases.length, 0)}`,
  `-- Audio placeholders: ${lessons.reduce((sum, lesson) => sum + lesson.audioPlaceholders.length, 0)}`,
  ""
);

const sql = sqlLines.join("\n");

fs.writeFileSync(sqlOut, sql);

console.log(`Imported ${lessons.length} A0-B2 lessons.`);
console.log(`Wrote ${path.relative(root, jsonOut)}`);
console.log(`Wrote ${path.relative(root, sqlOut)}`);
