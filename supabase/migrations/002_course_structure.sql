-- NederStart Migration 002: Course Structure

CREATE TABLE levels (
  id            SERIAL PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  sort_order    INT NOT NULL,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  xp_required   INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE level_translations (
  id          SERIAL PRIMARY KEY,
  level_id    INT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  locale      TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  UNIQUE(level_id, locale)
);

CREATE TABLE modules (
  id            SERIAL PRIMARY KEY,
  level_id      INT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  sort_order    INT NOT NULL,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE module_translations (
  id          SERIAL PRIMARY KEY,
  module_id   INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  locale      TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  UNIQUE(module_id, locale)
);

CREATE INDEX idx_modules_level_id ON modules(level_id);

CREATE TABLE lessons (
  id                SERIAL PRIMARY KEY,
  module_id         INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  lesson_code       TEXT NOT NULL UNIQUE,
  sort_order        INT NOT NULL,
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  is_free           BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_minutes INT NOT NULL DEFAULT 10,
  xp_reward         INT NOT NULL DEFAULT 50,
  prerequisite_lesson_id INT REFERENCES lessons(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lesson_translations (
  id                   SERIAL PRIMARY KEY,
  lesson_id            INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  locale               TEXT NOT NULL,
  title                TEXT NOT NULL,
  description          TEXT,
  learning_objectives  TEXT[],
  UNIQUE(lesson_id, locale)
);

CREATE TABLE lesson_sections (
  id          SERIAL PRIMARY KEY,
  lesson_id   INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  sort_order  INT NOT NULL,
  section_type TEXT NOT NULL,
  content     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_lesson_code ON lessons(lesson_code);
CREATE INDEX idx_lesson_sections_lesson_id ON lesson_sections(lesson_id);
