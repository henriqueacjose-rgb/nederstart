-- NederStart Migration 001: Profiles
-- Reference schema for Supabase deployment
-- In the current setup, this is handled by Prisma (User model)

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'learner',
  ui_locale     TEXT NOT NULL DEFAULT 'en',
  timezone      TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  learning_goal     TEXT,
  study_frequency   INT,
  starting_level    TEXT NOT NULL DEFAULT 'A0',
  plan              TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_ui_locale ON profiles(ui_locale);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
