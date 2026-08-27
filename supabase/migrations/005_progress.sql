-- NederStart Migration 005: Progress

CREATE TABLE lesson_progress (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id     INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'not_started',
  score         INT,
  time_spent_s  INT,
  completed_at  TIMESTAMPTZ,
  started_at    TIMESTAMPTZ,
  attempt_count INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE vocabulary_progress (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vocabulary_id   INT NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'new',
  correct_count   INT NOT NULL DEFAULT 0,
  incorrect_count INT NOT NULL DEFAULT 0,
  last_reviewed   TIMESTAMPTZ,
  next_review     TIMESTAMPTZ,
  ease_factor     FLOAT NOT NULL DEFAULT 2.5,
  UNIQUE(user_id, vocabulary_id)
);

CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_vocabulary_progress_user_id ON vocabulary_progress(user_id);
CREATE INDEX idx_vocabulary_progress_next_review ON vocabulary_progress(user_id, next_review);
