import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../../..");
const lessonsRoot = path.join(root, "outputs/nederstart-course/lessons");
const outMd = path.join(root, "nederstart/AUDIO_RECORDING_MANIFEST_A0_A1.md");
const outCsv = path.join(root, "nederstart/AUDIO_RECORDING_MANIFEST_A0_A1.csv");

function slug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readLessonFiles(levelCode) {
  const dir = path.join(lessonsRoot, levelCode);
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => {
      const markdown = fs.readFileSync(path.join(dir, file), "utf8");
      const heading = markdown.match(/^#\s+([A-Z0-9-]+)\s+(?:-|â€”|Ã¢â‚¬â€)\s+(.+)$/m);
      const fallback = file.match(/^([A-Z0-9-]+)-(.+)\.md$/);
      const code = heading?.[1] ?? fallback?.[1] ?? file.replace(".md", "");
      const title =
        heading?.[2]?.trim() ??
        fallback?.[2]
          ?.split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ") ??
        code;
      return { code, title, levelCode, markdown };
    });
}

function fieldValue(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}:\\s*(.+)`));
  return match?.[1]?.replace(/\s{2,}.*/, "").replaceAll("`", "").trim() ?? "";
}

function fencedAfter(text, label) {
  const index = text.indexOf(label);
  if (index === -1) return "";
  const rest = text.slice(index);
  return rest.match(/```(?:text)?\s*([\s\S]*?)```/)?.[1]?.trim() ?? "";
}

function priorityFor(lessonCode, type) {
  if (lessonCode === "A0-01" && type !== "dialogue") return "P0";
  if (lessonCode.startsWith("A0-")) return "P1";
  return "P2";
}

function parseVocabulary(lesson) {
  return lesson.markdown
    .split(/\n#{3,4}\s+(?:Palavra|Palavra opcional)\s+\d+/)
    .slice(1)
    .map((chunk, index) => {
      const textNl = fieldValue(chunk, "Palavra");
      const fileUrl = fieldValue(chunk, "Audio nativo");
      if (!textNl || !fileUrl) return null;
      return {
        priority: priorityFor(lesson.code, "word"),
        level: lesson.levelCode,
        lessonCode: lesson.code,
        lessonTitle: lesson.title,
        assetType: "word",
        speed: "natural",
        fileName: path.basename(fileUrl),
        storagePath: fileUrl,
        textNl,
        notes: index >= 6 && lesson.code === "A0-01" ? "Optional review item" : "Record isolated word clearly"
      };
    })
    .filter(Boolean);
}

function parsePhrases(lesson) {
  const entries = [];
  const chunks = lesson.markdown.split(/\n#{3,4}\s+(?:Frase|Frase opcional)\s+\d+/).slice(1);
  chunks.forEach((chunk, index) => {
    const textNl = fieldValue(chunk, "Frase");
    const naturalPath = fieldValue(chunk, "Audio nativo");
    if (!textNl || !naturalPath) return;
    const slowText = fencedAfter(chunk, "Forma lenta:") || textNl;
    const naturalText = fencedAfter(chunk, "Forma natural:") || textNl;
    const slowPath = naturalPath.replace(".native.nl.mp3", ".slow.native.nl.mp3");
    const optionalNote = index >= 4 && lesson.code === "A0-01" ? " Optional review phrase." : "";
    entries.push({
      priority: priorityFor(lesson.code, "phrase"),
      level: lesson.levelCode,
      lessonCode: lesson.code,
      lessonTitle: lesson.title,
      assetType: "phrase",
      speed: "slow",
      fileName: path.basename(slowPath),
      storagePath: slowPath,
      textNl: slowText,
      notes: `Record slowly, with clear pauses.${optionalNote}`.trim()
    });
    entries.push({
      priority: priorityFor(lesson.code, "phrase"),
      level: lesson.levelCode,
      lessonCode: lesson.code,
      lessonTitle: lesson.title,
      assetType: "phrase",
      speed: "natural",
      fileName: path.basename(naturalPath),
      storagePath: naturalPath,
      textNl: naturalText,
      notes: `Record at natural Dutch speed.${optionalNote}`.trim()
    });
  });
  return entries;
}

function isPortugueseTranslationLine(line) {
  return /\b(Bom dia|Tem marcacao|Desculpe|Pode falar|Sim, claro|Tenho uma marcacao|Fala ingles|Falo um pouco|Nao entendo)\b/i.test(line);
}

function parseDialogue(lesson) {
  const blockMatch = lesson.markdown.match(/##\s+\d+\.\s+Mini dialogo realista([\s\S]*?)(?=\n##\s+\d+\.|\s*$)/);
  const body = blockMatch?.[1] ?? "";
  const codeBlock = body.match(/```text\s*([\s\S]*?)```/)?.[1]?.trim() ?? "";
  if (!codeBlock) return [];
  const lines = codeBlock
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isPortugueseTranslationLine(line));
  if (lines.length === 0) return [];
  const storagePath = `audio/${lesson.code}/dialogues/${slug(lesson.code)}-mini-dialogue.native.nl.mp3`;
  return [
    {
      priority: lesson.code.startsWith("A0-") ? "P1" : "P2",
      level: lesson.levelCode,
      lessonCode: lesson.code,
      lessonTitle: lesson.title,
      assetType: "dialogue",
      speed: "natural",
      fileName: path.basename(storagePath),
      storagePath,
      textNl: lines.join(" / "),
      notes: "Record as a short two-person dialogue with natural interaction"
    }
  ];
}

const lessons = ["A0", "A1"].flatMap(readLessonFiles);
const entries = lessons.flatMap((lesson) => [
  ...parseVocabulary(lesson),
  ...parsePhrases(lesson),
  ...parseDialogue(lesson)
]);

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

const csvColumns = [
  "priority",
  "level",
  "lesson_code",
  "lesson_title",
  "asset_type",
  "speed",
  "file_name",
  "storage_path",
  "text_nl",
  "notes"
];

const csv = [
  csvColumns.join(","),
  ...entries.map((entry) =>
    [
      entry.priority,
      entry.level,
      entry.lessonCode,
      entry.lessonTitle,
      entry.assetType,
      entry.speed,
      entry.fileName,
      entry.storagePath,
      entry.textNl,
      entry.notes
    ]
      .map(csvCell)
      .join(",")
  )
].join("\n");

const byType = entries.reduce((acc, entry) => {
  const key = `${entry.assetType}:${entry.speed}`;
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});

const mdLines = [
  "# AUDIO_RECORDING_MANIFEST_A0_A1",
  "",
  "Purpose: recording list for native Dutch audio required before closed beta.",
  "",
  "Recording rule: native audio is the reference. Written pronunciation support is not the pronunciation target.",
  "",
  "## Summary",
  "",
  `- Lessons covered: ${lessons.length}`,
  `- Total audio assets required: ${entries.length}`,
  `- Isolated words: ${byType["word:natural"] ?? 0}`,
  `- Phrases slow: ${byType["phrase:slow"] ?? 0}`,
  `- Phrases natural: ${byType["phrase:natural"] ?? 0}`,
  `- Dialogues natural: ${byType["dialogue:natural"] ?? 0}`,
  "",
  "## Priorities",
  "",
  "- P0: A0-01 core and optional review audio. Record first.",
  "- P1: remaining A0 audio. Record before first learner beta.",
  "- P2: A1 audio. Record before expanding beta beyond A0.",
  "",
  "## Recording Manifest",
  "",
  "| Priority | Level | Lesson | Type | Speed | Expected file | Dutch text to record | Notes |",
  "|---|---|---|---|---|---|---|---|",
  ...entries.map(
    (entry) =>
      `| ${entry.priority} | ${entry.level} | ${entry.lessonCode} | ${entry.assetType} | ${entry.speed} | \`${entry.storagePath}\` | ${entry.textNl.replaceAll("|", "/")} | ${entry.notes.replaceAll("|", "/")} |`
  ),
  ""
];

fs.writeFileSync(outCsv, `${csv}\n`);
fs.writeFileSync(outMd, `${mdLines.join("\n")}\n`);

console.log(`Audio assets required: ${entries.length}`);
console.log(`Wrote ${path.relative(root, outMd)}`);
console.log(`Wrote ${path.relative(root, outCsv)}`);
