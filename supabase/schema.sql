-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Quizzes table
CREATE TABLE quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL,
  type TEXT CHECK (type IN ('multiple_choice', 'essay')) NOT NULL,
  question_text TEXT NOT NULL,
  hint TEXT,
  correct_answer TEXT NOT NULL,
  options JSONB, -- For MCQ: ["option1", "option2", "option3", "option4"]
  correct_option_index INTEGER, -- For MCQ: 0-3
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS Policies
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
CREATE POLICY "Quizzes are viewable by everyone" ON quizzes
  FOR SELECT USING (true);

CREATE POLICY "Users can create quizzes" ON quizzes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only creator can update quiz" ON quizzes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Only creator can delete quiz" ON quizzes
  FOR DELETE USING (auth.uid() = created_by);

-- Questions policies
CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Quiz creator can insert questions" ON questions
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT created_by FROM quizzes WHERE id = quiz_id)
  );

CREATE POLICY "Quiz creator can update questions" ON questions
  FOR UPDATE USING (
    auth.uid() = (SELECT created_by FROM quizzes WHERE id = quiz_id)
  );

CREATE POLICY "Quiz creator can delete questions" ON questions
  FOR DELETE USING (
    auth.uid() = (SELECT created_by FROM quizzes WHERE id = quiz_id)
  );

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at DESC);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id, order_index);
