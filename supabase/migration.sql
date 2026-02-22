-- =============================================
-- MIGRATION: Add new features to QuizForge
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add timer and settings to quizzes
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS timer_seconds INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS randomize_questions BOOLEAN DEFAULT FALSE;

-- 2. Add explanation to questions
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS explanation TEXT DEFAULT NULL;

-- 3. Quiz attempts table (history + leaderboard)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  time_taken_seconds INTEGER DEFAULT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS for quiz_attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all attempts for leaderboard" ON quiz_attempts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attempts" ON quiz_attempts
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_id ON quiz_attempts(quiz_id, percentage DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON quiz_attempts(user_id, completed_at DESC);
