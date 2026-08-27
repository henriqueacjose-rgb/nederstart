-- NederStart Migration 003: Vocabulary

CREATE TABLE vocabulary (
  id            SERIAL PRIMARY KEY,
  dutch_word    TEXT NOT NULL,
  word_type     TEXT,
  gender        TEXT,
  difficulty    INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vocabulary_translations (
  id              SERIAL PRIMARY KEY,
  vocabulary_id   INT NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  locale          TEXT NOT NULL,
  translation     TEXT NOT NULL,
  pronunciation_hint TEXT,
  example_sentence TEXT,
  UNIQUE(vocabulary_id, locale)
);

CREATE TABLE lesson_vocabulary (
  lesson_id     INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  vocabulary_id INT NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, vocabulary_id)
);

CREATE TABLE audio_assets (
  id            SERIAL PRIMARY KEY,
  storage_path  TEXT NOT NULL,
  asset_type    TEXT NOT NULL,
  vocabulary_id INT REFERENCES vocabulary(id),
  lesson_id     INT REFERENCES lessons(id),
  speaker_code  TEXT,
  duration_ms   INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vocabulary_translations_locale ON vocabulary_translations(vocabulary_id, locale);
CREATE INDEX idx_audio_assets_vocabulary_id ON audio_assets(vocabulary_id);
CREATE INDEX idx_audio_assets_lesson_id ON audio_assets(lesson_id);
