-- NederStart Migration 006: Gamification

CREATE TABLE user_streaks (
  user_id           UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak    INT NOT NULL DEFAULT 0,
  longest_streak    INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_available INT NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_xp_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount   INT NOT NULL,
  reason      TEXT NOT NULL,
  reference_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_xp_events_user_id ON user_xp_events(user_id);

CREATE VIEW user_total_xp AS
  SELECT user_id, COALESCE(SUM(xp_amount), 0) AS total_xp
  FROM user_xp_events
  GROUP BY user_id;

CREATE TABLE achievements (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  xp_bonus    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE achievement_translations (
  id              SERIAL PRIMARY KEY,
  achievement_id  INT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  locale          TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  UNIQUE(achievement_id, locale)
);

CREATE TABLE user_achievements (
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id  INT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);
