-- NederStart Migration 004: Exercises

CREATE TABLE exercises (
  id              SERIAL PRIMARY KEY,
  exercise_type   TEXT NOT NULL,
  difficulty      INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exercise_translations (
  id            SERIAL PRIMARY KEY,
  exercise_id   INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  locale        TEXT NOT NULL,
  question      TEXT NOT NULL,
  instruction   TEXT,
  explanation   TEXT,
  UNIQUE(exercise_id, locale)
);

CREATE TABLE exercise_options (
  id            SERIAL PRIMARY KEY,
  exercise_id   INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sort_order    INT NOT NULL,
  option_text   TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT FALSE,
  feedback      TEXT
);

CREATE INDEX idx_exercise_options_exercise_id ON exercise_options(exercise_id);
