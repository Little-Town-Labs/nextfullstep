# NextFullStep Codebase Audit

**Date**: 2025-10-14
**Purpose**: Audit existing codebase before refactoring for AI Career Transition MVP

---

## 1. Project Overview

**Framework**: Next.js 14.2.5 with App Router
**Language**: TypeScript
**Database**: SQLite with TypeORM
**AI Integration**: OpenAI SDK (@ai-sdk/openai v0.0.40, openai v4.54.0)
**UI Framework**: React 18 with Tailwind CSS + shadcn/ui components

---

## 2. Current Architecture

### Directory Structure
```
nextfullstep/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── actions.tsx         # Server actions for AI streaming
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page (Chat interface)
│   │   ├── admin/
│   │   │   └── ai-coaching-prompt/
│   │   │       └── page.tsx    # Admin prompt editor
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   └── ai-coaching-prompt/
│   │   │   │       └── route.ts   # Prompt CRUD API
│   │   │   └── bigfiveResults/    # Personality test results APIs
│   │   ├── bigfiveResults/        # Personality test pages
│   │   └── genui/                 # GenUI demo page
│   ├── components/
│   │   ├── chat.tsx            # Main chat interface
│   │   ├── header.tsx          # App header
│   │   ├── weather.tsx         # Weather component (demo)
│   │   ├── cards/              # Card components
│   │   └── ui/                 # shadcn/ui components
│   ├── entities/               # TypeORM entities
│   │   ├── AICoachingPromptEntity.ts
│   │   └── BigFiveResultEntity.ts
│   └── lib/
│       ├── bigfiveResults.ts   # Big Five logic
│       └── utils.ts            # Utility functions
├── database.sqlite             # SQLite database file
├── ProjectDocs/                # Documentation folder
│   ├── career-pathing-prompts.md
│   ├── ai-career-transition-user-flow.md
│   └── codebase-audit.md (this file)
└── package.json
```

---

## 3. Existing Database Schema

### TypeORM Entities

#### AICoachingPromptEntity
```typescript
Table: ai_coaching_prompts
Fields:
- id: uuid (PK)
- prompt: text
- updatedBy: varchar(36) // userId of admin
- createdAt: datetime
- updatedAt: datetime
```

#### BigFiveResultEntity
```typescript
Table: bigfive_results
Fields:
- id: uuid (PK)
- category: varchar(100)
- score: integer
- comment: text (nullable)
- userTestId: varchar(50)
- userId: varchar(36)
- resultType: varchar(20) // 'category' or 'subcategory'
- createdAt: datetime

Unique constraint: (userId, userTestId, category, resultType)
```

---

## 4. Current Features

### 4.1 AI Chat Interface ([src/app/page.tsx](src/app/page.tsx))
- Simple chat UI using OpenAI GPT-3.5-turbo
- Streams responses in real-time
- Fetches system prompt from admin API dynamically
- No conversation persistence (messages reset on refresh)

### 4.2 Admin Prompt Editor ([src/app/admin/ai-coaching-prompt/page.tsx](src/app/admin/ai-coaching-prompt/page.tsx))
- Client-side page for editing AI coaching prompt
- Stores single prompt in database
- Basic auth check via `x-admin` header (demo/placeholder)
- Shows last updated timestamp and user ID

### 4.3 Big Five Personality Test
- API routes for importing/storing personality test results
- Pages for viewing results and uploading data
- Not directly related to MVP, but could be integrated later

### 4.4 GenUI Demo ([src/app/genui/page.tsx](src/app/genui/page.tsx))
- Demonstrates AI tool calling with weather component
- Uses streaming UI components
- Shows pattern for interactive AI responses

---

## 5. AI Integration Details

### Current Setup ([src/app/actions.tsx](src/app/actions.tsx))

**Model Used**: `gpt-3.5-turbo` (line 42)
**API**: OpenAI SDK with Vercel AI SDK for streaming

**Key Functions**:
1. `continueTextConversation(messages)` - Main chat streaming function
   - Fetches system prompt from `/api/admin/ai-coaching-prompt`
   - Streams responses using `streamText()`
   - Returns streamable value for client consumption

2. `continueConversation(history)` - GenUI with tool calling
   - Demonstrates how to implement tool calls (weather example)
   - Creates streamable UI components

**Environment Variables** ([.env](.env)):
```
OPENAI_API_KEY=sk-proj-... (valid key present)
OPENROUTER_API_KEY=sk-or-v1-... (also available)
```

---

## 6. Database Connection Pattern

**Location**: Each API route creates its own DataSource
**Pattern** (from [src/app/api/admin/ai-coaching-prompt/route.ts](src/app/api/admin/ai-coaching-prompt/route.ts)):

```typescript
const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,  // Auto-creates tables
  logging: false,
  entities: [AICoachingPromptEntity],
  migrations: [],
  subscribers: [],
});

// In route handlers:
if (!AppDataSource.isInitialized) {
  await AppDataSource.initialize();
}
const repo = AppDataSource.getRepository(EntityName);
```

**Note**: Each route duplicates DataSource creation. We should centralize this.

---

## 7. UI Components & Styling

### shadcn/ui Components Available
- Button ([src/components/ui/button.tsx](src/components/ui/button.tsx))
- Card ([src/components/ui/card.tsx](src/components/ui/card.tsx))
- Input ([src/components/ui/input.tsx](src/components/ui/input.tsx))
- Label ([src/components/ui/label.tsx](src/components/ui/label.tsx))
- Switch ([src/components/ui/switch.tsx](src/components/ui/switch.tsx))
- Icons ([src/components/ui/icons.tsx](src/components/ui/icons.tsx))

### Styling
- Tailwind CSS configured ([tailwind.config.ts](tailwind.config.ts))
- Custom animations available ([tailwindcss-animate](tailwindcss-animate))
- Dark mode support via class strategy

---

## 8. Gaps & Refactoring Needs for MVP

### 8.1 Database Schema
**Missing Entities**:
- ✅ User profile entity (for storing user info)
- ✅ Career assessment entity (store assessment responses)
- ✅ Roadmap entity (personalized career roadmap)
- ✅ Roadmap task entity (individual tasks in roadmap)
- ✅ Portfolio item entity (optional, for future)
- ✅ Job application entity (optional, for future)

**Needed Changes**:
- Create centralized DataSource configuration
- Add proper migrations instead of `synchronize: true`
- Add indexes for performance (userId lookups)

### 8.2 Authentication
**Current State**: No real auth, just placeholder `x-admin` header check

**MVP Requirements**:
- User registration/login (can be basic email/password)
- Session management
- Protected routes for assessments/dashboard
- User ID tracking for all user data

**Recommendation**: Use next-auth or clerk for MVP speed

### 8.3 Assessment Flow
**Missing**:
- UI for 8-question structured interview
- State management for multi-step assessment
- Progress indicators
- Answer persistence (save in progress)
- Assessment submission API
- GPT-4o-mini integration for analysis

### 8.4 Career Path Selection
**Missing**:
- Landing page with 3 role cards (AI Prompt Engineer, AI Content Creator, AI Coach)
- Role description pages
- Role selection persistence

### 8.5 Roadmap System
**Missing**:
- Roadmap generation logic (GPT-4o-mini based)
- Roadmap display UI (phases, tasks, timeline)
- Task tracking (mark complete, add notes)
- Progress dashboard
- Milestone celebrations

### 8.6 Prompt Management
**Current**: Single prompt in admin editor

**Needed**:
- Store 3 career prompts separately
- Associate prompts with role IDs
- Load correct prompt based on user's selected role
- Version control for prompts (optional but recommended)

---

## 9. Recommended Refactoring Plan

### Phase 1: Core Infrastructure (Week 1)
1. **Database Setup**
   - Create centralized DataSource ([src/lib/data-source.ts](src/lib/data-source.ts))
   - Create new entities (User, CareerAssessment, Roadmap, RoadmapTask)
   - Add proper migrations
   - Seed 3 career prompts into database

2. **Authentication**
   - Install next-auth or clerk
   - Create user registration/login pages
   - Protect assessment routes
   - Add user session to context

### Phase 2: Career Selection & Assessment (Week 2)
3. **Career Path Selection**
   - Create new landing page with 3 role cards
   - Create role detail pages
   - API to save selected role to user profile

4. **Assessment Flow**
   - Build multi-step form component
   - Create assessment API routes (start, submit answer, complete)
   - Integrate GPT-4o-mini for analysis
   - Store assessment results

### Phase 3: Roadmap & Dashboard (Week 3)
5. **Roadmap Generation**
   - GPT-4o-mini prompt engineering for roadmap creation
   - Parse GPT response into structured data
   - Save roadmap to database

6. **Roadmap Display**
   - Build phase cards (Immediate, 3-6 Month, 6-12 Month)
   - Task list component with checkboxes
   - Progress indicators

7. **Dashboard**
   - Show assessment verdict
   - Display roadmap progress
   - Quick stats (tasks complete, days active, etc.)

### Phase 4: Polish & Launch (Week 4)
8. **UI/UX Polish**
   - Responsive design
   - Loading states
   - Error handling
   - Success celebrations

9. **Admin Tools**
   - Bulk prompt management
   - User analytics

10. **Deployment**
    - Environment setup
    - Database migration strategy
    - Deploy to Vercel

---

## 10. Migration Strategy

### Keep & Reuse
- ✅ Next.js App Router structure
- ✅ Tailwind + shadcn/ui components
- ✅ OpenAI integration pattern
- ✅ Streaming text responses
- ✅ TypeORM with SQLite (good for MVP)
- ✅ Server actions pattern

### Refactor
- 🔄 Centralize database connection
- 🔄 Move from single prompt to multi-prompt system
- 🔄 Replace placeholder auth with real auth

### Add New
- ➕ User authentication system
- ➕ Assessment flow components
- ➕ Roadmap system
- ➕ Dashboard
- ➕ New database entities
- ➕ Career selection UI

### Archive/Remove (Optional)
- 📦 Big Five personality test (not needed for MVP, keep for future)
- 📦 GenUI demo page (move to examples folder)
- 📦 Weather component (demo only)

---

## 11. Technology Stack Confirmation

**Frontend**:
- Next.js 14 App Router ✅
- React 18 ✅
- TypeScript ✅
- Tailwind CSS + shadcn/ui ✅

**Backend**:
- Next.js API Routes ✅
- TypeORM ✅
- SQLite ✅ (good for MVP, can migrate to Postgres later)

**AI**:
- OpenAI GPT-4o-mini ⚠️ (need to change from gpt-3.5-turbo)
- Vercel AI SDK ✅

**Deployment**:
- Vercel (recommended) or similar

---

## 12. Next Steps

1. ✅ Audit complete
2. ⏳ Extract 3 priority career prompts to separate files
3. ⏳ Create database entities for User, Assessment, Roadmap
4. ⏳ Set up centralized database connection
5. ⏳ Choose and implement authentication solution
6. ⏳ Build career path selection UI
7. ⏳ Create assessment flow
8. ⏳ Integrate GPT-4o-mini for assessment analysis
9. ⏳ Build roadmap generation and display
10. ⏳ Create user dashboard

---

## 13. Key Files for MVP Development

**Must Modify**:
- [src/app/page.tsx](src/app/page.tsx) - Replace chat with career selection
- [src/app/actions.tsx](src/app/actions.tsx) - Add assessment analysis action
- [src/entities/](src/entities/) - Add new entities

**Must Create**:
- `src/lib/data-source.ts` - Centralized DB connection
- `src/app/careers/page.tsx` - Career selection page
- `src/app/assessment/[roleId]/page.tsx` - Assessment flow
- `src/app/dashboard/page.tsx` - User dashboard
- `src/app/roadmap/page.tsx` - Roadmap display
- `src/app/api/assessment/route.ts` - Assessment APIs
- `src/app/api/roadmap/route.ts` - Roadmap APIs

**Can Keep As-Is** (for now):
- All UI components in [src/components/ui/](src/components/ui/)
- [src/lib/utils.ts](src/lib/utils.ts)
- Big Five results (archive for future use)

---

## 14. Estimated Effort

**Total MVP**: 3-4 weeks (working with Claude Code)

**Breakdown**:
- Infrastructure & Auth: 3-5 days
- Career Selection UI: 2-3 days
- Assessment Flow: 4-6 days
- Roadmap System: 4-6 days
- Dashboard: 2-3 days
- Polish & Testing: 3-4 days
- Deployment: 1-2 days

---

**Status**: Audit complete, ready to begin implementation 🚀
