# NextFullStep

**AI-Powered Career Transition Platform**

NextFullStep is an intelligent career guidance platform that helps professionals transition into AI careers through personalized assessments, honest qualification analysis, and actionable roadmaps.

---

## 🎯 What It Does

NextFullStep provides:

- **AI-Powered Career Assessments** - 8 targeted questions analyzed by GPT-4o-mini
- **Brutally Honest Qualification Verdicts** - 4-tier system (Qualified Now, Nearly Qualified, Significant Gaps, Not Viable)
- **Personalized Career Roadmaps** - Phase-based action plans with trackable tasks
- **Progress Tracking** - Visual dashboards, streak tracking, and milestone monitoring

---

## 🚀 Features

### Current Features (MVP - ~80% Complete)

✅ **3 AI Career Paths**
- AI Prompt Engineer
- AI Content Creator
- AI Coach

✅ **Smart Assessment System**
- 8 question evaluation per role
- Auto-save and resume capability
- GPT-4o-mini powered analysis

✅ **Qualification Analysis**
- Match score (0-100%)
- Timeline estimation
- Strengths and gaps identification
- Personalized verdict with emoji badges

✅ **Automated Roadmap Generation**
- Parsed from GPT analysis into structured tasks
- 3 phases: Immediate (30 days), Short-term (3-6 months), Long-term (6-12 months)
- Priority levels (CRITICAL, HIGH, NORMAL, LOW)
- Estimated hours per task
- Resource links

✅ **Progress Tracking**
- Task completion checkboxes
- Progress percentage
- Streak tracking (current & longest)
- Personal notes on tasks
- Days active counter

### Coming Soon

⏳ **User Dashboard** - Central hub for all assessments and roadmaps
⏳ **Authentication** - Secure user accounts (NextAuth/Clerk)
⏳ **Multiple Roadmaps** - Track progress across different career paths
⏳ **Advanced Analytics** - Detailed progress charts and insights

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **TypeORM** - Database ORM
- **NeonDB (PostgreSQL)** - Serverless database

### AI
- **OpenAI GPT-4o-mini** - Career analysis and roadmap generation
- **Vercel AI SDK** - AI integration utilities

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **PostgreSQL database** (NeonDB account recommended)
- **OpenAI API key**

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/nextfullstep.git
cd nextfullstep
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# NeonDB PostgreSQL Connection
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

**Getting your API keys:**

- **OpenAI API Key**: Sign up at [platform.openai.com](https://platform.openai.com)
- **NeonDB**: Create free account at [neon.tech](https://neon.tech) and create a database

4. **Seed the database**

The database tables will be auto-created on first run (TypeORM synchronize mode).

Seed the 3 career roles:
```bash
# Visit in browser after starting dev server:
http://localhost:3000/api/seed
```

5. **Run the development server**
```bash
pnpm dev
# or
npm run dev
```

6. **Open in browser**
```
http://localhost:3000
```

You should see the careers landing page with 3 AI career options.

---

## 📁 Project Structure

```
nextfullstep/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes
│   │   │   ├── assessment/       # Assessment CRUD endpoints
│   │   │   ├── careers/          # Career roles endpoints
│   │   │   ├── roadmap/          # Roadmap and task endpoints
│   │   │   └── seed/             # Database seeding
│   │   ├── assessment/           # Assessment flow pages
│   │   │   ├── [roleId]/         # Role-specific assessment
│   │   │   └── [assessmentId]/results/  # Results page
│   │   ├── careers/              # Career selection landing page
│   │   ├── roadmap/[roadmapId]/  # Roadmap display page
│   │   └── actions.tsx           # Server actions (GPT integration)
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   └── career/               # Career-specific components
│   ├── entities/                 # TypeORM entity definitions
│   │   ├── UserEntity.ts
│   │   ├── CareerRoleEntity.ts
│   │   ├── CareerAssessmentEntity.ts
│   │   ├── RoadmapEntity.ts
│   │   ├── RoadmapTaskEntity.ts
│   │   ├── AICoachingPromptEntity.ts
│   │   └── BigFiveResultEntity.ts
│   ├── lib/                      # Utility libraries
│   │   ├── data-source.ts        # TypeORM database connection
│   │   ├── assessment-questions.ts  # Question library
│   │   └── parse-roadmap.ts      # Roadmap parsing logic
│   └── styles/                   # Global styles
├── ProjectDocs/                  # Development documentation
├── archive/                      # Archived prompts and configs
├── .env                          # Environment variables (not in git)
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
└── next.config.js                # Next.js config
```

---

## 🎮 Usage Guide

### 1. Choose a Career Path

Visit `/careers` and select one of 3 AI careers:
- **AI Prompt Engineer** - Design and optimize AI prompts
- **AI Content Creator** - Create AI-generated content
- **AI Coach** - Help clients leverage AI tools

### 2. Take the Assessment

Answer 8 targeted questions about:
- Professional background
- Relevant skills and experience
- Learning ability and commitment
- Time availability
- Financial readiness

**Features:**
- Auto-save on each question
- Resume anytime from where you left off
- Takes 5-10 minutes

### 3. Get Your Verdict

GPT-4o-mini analyzes your responses and provides:

**4 Possible Verdicts:**
- ✅ **QUALIFIED NOW** - Ready to start immediately (85% match)
- ⚡ **NEARLY QUALIFIED** - Close, minor gaps (65% match)
- 📚 **SIGNIFICANT GAPS** - Needs preparation (40% match)
- 🔄 **NOT VIABLE** - Consider alternative path (20% match)

**Analysis Includes:**
- Match score (0-100%)
- Estimated timeline
- Your strengths
- Gap areas
- Personalized recommendations

### 4. Follow Your Roadmap

Click "View Your Roadmap" to access your personalized action plan:

**3 Phases:**
1. **Immediate Actions** (Next 30 days) - Quick wins and foundational tasks
2. **3-6 Month Goals** - Skill building and portfolio development
3. **6-12 Month Milestones** - Advanced skills and career launch

**Track Progress:**
- ✓ Check off tasks as you complete them
- 📝 Add personal notes to tasks
- 📊 Monitor progress percentage
- 🔥 Track daily streaks
- 🔗 Access resource links

---

## 🗄️ Database Schema

### Core Entities

**UserEntity** - Basic user profile (email, selected role, location)

**CareerRoleEntity** - Career path definitions with GPT system prompts

**CareerAssessmentEntity** - User assessment responses and GPT analysis

**RoadmapEntity** - Generated roadmap linked to assessment with progress metrics

**RoadmapTaskEntity** - Individual tasks within roadmap

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository

3. **Add Environment Variables**

In Vercel dashboard → Settings → Environment Variables:
```
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://...
```

4. **Deploy**
- Vercel deploys automatically
- Visit your production URL
- Run `/api/seed` to seed career roles

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o-mini |
| `DATABASE_URL` | Yes | PostgreSQL connection string (NeonDB recommended) |

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🗺️ Roadmap

### Phase 1: MVP (Current - 80% Complete)
- [x] Career selection UI
- [x] Assessment flow with 8 questions
- [x] GPT-4o-mini integration
- [x] Verdict analysis with 4 tiers
- [x] Automated roadmap generation
- [x] Progress tracking with tasks
- [ ] User dashboard
- [ ] Authentication

### Phase 2: Enhanced Features
- [ ] Email notifications and reminders
- [ ] Roadmap regeneration/refresh
- [ ] Task dependencies
- [ ] Resource library with ratings
- [ ] Progress charts and analytics

### Phase 3: Community
- [ ] Accountability partners
- [ ] Group roadmaps for cohorts
- [ ] Mentor matching
- [ ] Success story sharing

---

**Built with ❤️ for career transitioners everywhere**

*Helping professionals transition into the AI economy, one step at a time.*
