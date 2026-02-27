-- ============================================================
-- Habity — Supabase Database Schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

-- ─── Profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  step_goal INTEGER DEFAULT 10000,
  reminder_time TEXT DEFAULT '20:00',
  timezone TEXT DEFAULT 'UTC',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);


-- ─── Habits ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 100),
  monthly_goal INTEGER DEFAULT 20 CHECK (monthly_goal >= 1 AND monthly_goal <= 31),
  color TEXT DEFAULT '#6C63FF',
  icon TEXT,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  reminder_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habits_archived_idx ON habits(user_id, archived_at);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);


-- ─── Completions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

CREATE INDEX IF NOT EXISTS completions_habit_id_idx ON completions(habit_id);
CREATE INDEX IF NOT EXISTS completions_user_date_idx ON completions(user_id, date);

ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions" ON completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions" ON completions
  FOR DELETE USING (auth.uid() = user_id);


-- ─── Badges (Definitions) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('streak', 'completion', 'step', 'special')),
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  requirement INTEGER NOT NULL,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT TO authenticated USING (true);


-- Seed 30 badge definitions
INSERT INTO badges (name, description, type, tier, requirement, icon_name) VALUES
  ('21-Day Warrior', 'Complete any habit for 21 consecutive days', 'streak', 'bronze', 21, 'fire-bronze'),
  ('45-Day Champion', 'Complete any habit for 45 consecutive days', 'streak', 'silver', 45, 'fire-silver'),
  ('100-Day Legend', 'Complete any habit for 100 consecutive days', 'streak', 'gold', 100, 'fire-gold'),
  ('365-Day Master', 'Complete any habit for an entire year', 'streak', 'platinum', 365, 'fire-platinum'),
  ('Perfect Week', 'Complete all active habits for 7 consecutive days', 'completion', 'bronze', 7, 'calendar-check'),
  ('Perfect Month', 'Achieve monthly goal for all habits in one month', 'completion', 'silver', 1, 'calendar-star'),
  ('Comeback Kid', 'Restart a habit within 3 days of breaking a streak', 'completion', 'bronze', 1, 'refresh'),
  ('Early Bird', 'Complete 7 check-ins before 9 AM', 'completion', 'bronze', 7, 'sunrise'),
  ('Night Owl', 'Complete 7 check-ins after 9 PM', 'completion', 'bronze', 7, 'moon'),
  ('100 Completions Club', 'Total 100 habit completions', 'completion', 'bronze', 100, 'trophy-bronze'),
  ('500 Completions Club', 'Total 500 habit completions', 'completion', 'silver', 500, 'trophy-silver'),
  ('1000 Completions Club', 'Total 1000 habit completions', 'completion', 'gold', 1000, 'trophy-gold'),
  ('5000 Completions Club', 'Total 5000 habit completions', 'completion', 'platinum', 5000, 'trophy-platinum'),
  ('10K Walker', 'Hit 10,000 steps in a single day', 'step', 'bronze', 10000, 'walk'),
  ('Marathon Month', 'Average 10,000+ steps for 30 consecutive days', 'step', 'silver', 30, 'run'),
  ('Step Streak - Week', '7 consecutive days hitting step goal', 'step', 'bronze', 7, 'footsteps-bronze'),
  ('Step Streak - 2 Weeks', '14 consecutive days hitting step goal', 'step', 'silver', 14, 'footsteps-silver'),
  ('Step Streak - Month', '30 consecutive days hitting step goal', 'step', 'gold', 30, 'footsteps-gold'),
  ('100km Milestone', 'Walk 100 kilometers total', 'step', 'bronze', 100, 'map-bronze'),
  ('500km Milestone', 'Walk 500 kilometers total', 'step', 'silver', 500, 'map-silver'),
  ('1000km Milestone', 'Walk 1000 kilometers total', 'step', 'gold', 1000, 'map-gold'),
  ('Habit Collector', 'Create 10 different habits', 'special', 'bronze', 10, 'collection'),
  ('Weekend Warrior', 'Complete all habits on 4 consecutive weekends', 'special', 'silver', 4, 'weekend'),
  ('Consistency King', 'Maintain 3 active streaks simultaneously', 'special', 'gold', 3, 'crown'),
  ('Early Adopter', 'Use the app for 30 consecutive days', 'special', 'bronze', 30, 'star'),
  ('Power User', 'Track 20+ different habits', 'special', 'silver', 20, 'lightning'),
  ('Year Strong', 'Use the app for 365 consecutive days', 'special', 'platinum', 365, 'diamond'),
  ('Social Butterfly', 'Share 5 achievements', 'special', 'bronze', 5, 'share'),
  ('Data Driven', 'View analytics 50 times', 'special', 'bronze', 50, 'chart'),
  ('Streak Protector', 'Save a streak 5 times', 'special', 'silver', 5, 'shield')
ON CONFLICT (name) DO NOTHING;


-- ─── User Badges ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id),
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges(user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ─── Step Data ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS step_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER NOT NULL CHECK (steps >= 0),
  distance FLOAT,
  calories INTEGER,
  active_minutes INTEGER,
  source TEXT DEFAULT 'pedometer' CHECK (source IN ('pedometer', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS step_data_user_date_idx ON step_data(user_id, date);

ALTER TABLE step_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own step data" ON step_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own step data" ON step_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own step data" ON step_data
  FOR UPDATE USING (auth.uid() = user_id);


-- ─── Enable Realtime ─────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
ALTER PUBLICATION supabase_realtime ADD TABLE completions;
ALTER PUBLICATION supabase_realtime ADD TABLE user_badges;
