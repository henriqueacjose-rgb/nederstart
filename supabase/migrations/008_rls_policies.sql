-- NederStart Migration 008: Row Level Security Policies
-- Applied when using Supabase. In the current setup, auth is handled by NextAuth middleware.

-- Profiles: users can only read/update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Lesson progress: users manage their own
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lesson progress" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Vocabulary progress: users manage their own
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vocabulary progress" ON vocabulary_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User streaks: users manage their own
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own streak" ON user_streaks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- XP events: users can read their own
ALTER TABLE user_xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own xp events" ON user_xp_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts xp events" ON user_xp_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User achievements: users can read their own
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Levels: publicly readable if published
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published levels are publicly readable" ON levels
  FOR SELECT USING (is_published = TRUE);

-- Level translations: follow parent
ALTER TABLE level_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Level translations are publicly readable" ON level_translations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM levels WHERE levels.id = level_translations.level_id AND levels.is_published = TRUE)
  );

-- Modules: publicly readable if published
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published modules are publicly readable" ON modules
  FOR SELECT USING (is_published = TRUE);

-- Module translations: follow parent
ALTER TABLE module_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Module translations are publicly readable" ON module_translations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM modules WHERE modules.id = module_translations.module_id AND modules.is_published = TRUE)
  );

-- Lessons: publicly readable if published
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published lessons are publicly readable" ON lessons
  FOR SELECT USING (is_published = TRUE);

-- Lesson translations: follow parent
ALTER TABLE lesson_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lesson translations are publicly readable" ON lesson_translations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lessons WHERE lessons.id = lesson_translations.lesson_id AND lessons.is_published = TRUE)
  );

-- Lesson sections: follow lesson
ALTER TABLE lesson_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lesson sections are publicly readable" ON lesson_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lessons WHERE lessons.id = lesson_sections.lesson_id AND lessons.is_published = TRUE)
  );

-- Vocabulary: publicly readable
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vocabulary is publicly readable" ON vocabulary FOR SELECT USING (TRUE);

-- Vocabulary translations: publicly readable
ALTER TABLE vocabulary_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vocabulary translations are publicly readable" ON vocabulary_translations FOR SELECT USING (TRUE);

-- Exercises: publicly readable
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercises are publicly readable" ON exercises FOR SELECT USING (TRUE);

-- Exercise translations: publicly readable
ALTER TABLE exercise_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercise translations are publicly readable" ON exercise_translations FOR SELECT USING (TRUE);

-- Exercise options: publicly readable
ALTER TABLE exercise_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercise options are publicly readable" ON exercise_options FOR SELECT USING (TRUE);

-- Audio assets: publicly readable
ALTER TABLE audio_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audio assets are publicly readable" ON audio_assets FOR SELECT USING (TRUE);

-- Plans: publicly readable
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are publicly readable" ON plans FOR SELECT USING (is_active = TRUE);

-- Subscriptions: users can read their own
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Note: Admin operations bypass RLS via service role key (server-side only).
-- Admin CRUD is performed through API routes using the Supabase service role client.
