# QuizForge — University Exam Practice Platform

A modern, dark-themed quiz platform for university students built with Next.js 14, Supabase, and Tailwind CSS.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (dark theme)
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Fonts**: Syne (display) + DM Mono (code/metadata)

---

## Features

- 🔐 Email/password auth via Supabase
- 📝 Create quizzes with MCQ and Essay questions
- 💡 Optional hints with smooth expand animation
- ✅ Instant correct/incorrect feedback with visual states
- 🔒 Access control — only quiz creators can edit/delete
- 📊 Score results screen with pass/fail indicator
- 🔍 Search quizzes by title or topic

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts
│   ├── globals.css             # Global styles + custom classes
│   ├── page.tsx                # Home page (quiz listing)
│   ├── auth/
│   │   ├── login/page.tsx      # Login form
│   │   └── signup/page.tsx     # Signup form
│   └── quiz/
│       ├── create/page.tsx     # Create quiz (2-step flow)
│       └── [id]/
│           ├── take/page.tsx   # Take quiz
│           └── edit/page.tsx   # Edit quiz (owner only)
├── components/
│   ├── layout/
│   │   └── Navbar.tsx
│   └── quiz/
│       ├── QuizCard.tsx        # Quiz listing card
│       ├── QuestionCard.tsx    # Interactive question card
│       ├── QuestionForm.tsx    # Question creation form
│       └── QuizResults.tsx     # Final score screen
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   ├── hooks/
│   │   └── useAuth.ts          # Auth state hook
│   └── utils/
│       └── quiz.ts             # Quiz CRUD utilities
├── types/
│   └── index.ts                # TypeScript interfaces
└── middleware.ts               # Route protection
```

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd quizforge
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Find these in your Supabase project: **Settings → API**

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

### `quizzes`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| title | text | Quiz title |
| topic | text | Subject area |
| question_count | int | Number of questions |
| created_by | uuid | FK → auth.users |
| created_at | timestamptz | Auto |

### `questions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| quiz_id | uuid | FK → quizzes |
| order_index | int | Question ordering |
| type | text | 'multiple_choice' or 'essay' |
| question_text | text | The question |
| hint | text | Optional hint |
| correct_answer | text | Expected answer |
| options | jsonb | MCQ: array of 4 strings |
| correct_option_index | int | MCQ: 0-3 |

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | FK → auth.users |
| email | text | User email |
| full_name | text | Display name |

Row Level Security is enabled on all tables. Only authenticated quiz creators can modify their own quizzes.

---

## Key Design Decisions

- **RLS over API routes**: All access control is enforced at the database level via Supabase RLS policies, not just the frontend
- **No global state manager**: Uses React state + Supabase client directly for simplicity
- **CSS Grid animation**: Hint expand uses `grid-template-rows` transition for smooth, performant animation
- **Key prop on QuestionCard**: `key={currentIndex}` forces remount between questions, resetting all local state cleanly
