# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextFullStep is an AI-powered career transition platform that helps professionals transition into AI careers through personalized assessments, honest qualification analysis, and actionable roadmaps. Built with Next.js 14, TypeORM, PostgreSQL (NeonDB), and integrated with Clerk authentication.

## Development Commands

### Local Development
```bash
pnpm install              # Install dependencies
pnpm dev                  # Start development server (http://localhost:3000)
pnpm build                # Build production bundle
pnpm start                # Run production build locally
pnpm lint                 # Run ESLint
```

### Database & Scripts
```bash
pnpm test:entities        # Test TypeORM entity CRUD operations
pnpm seed:models          # Seed AI model configurations
pnpm promote:admin        # Promote user to admin (requires userId)

# Database seeding endpoints (visit in browser after starting dev server)
http://localhost:3000/api/seed      # Seed career roles
http://localhost:3000/api/test-db   # Test database connection
```

## Architecture

### Database Layer (TypeORM + PostgreSQL)

**Core Principle**: Use singleton DataSource pattern to avoid connection pool exhaustion in serverless environments.

**Always use**:
```typescript
import { getRepository, initializeDatabase } from '@/lib/data-source';

// In API routes
const userRepo = await getRepository(UserEntity);
```

**Never create** new `DataSource()` instances directly. The `data-source.ts` manages connection pooling with proper serverless settings.

**Entity Structure**:
- `UserEntity` - User profiles with Clerk integration, admin flags, and selected career roles
- `CareerRoleEntity` - AI career path definitions with system prompts for GPT analysis
- `CareerAssessmentEntity` - User assessment responses (8 questions) with AI-generated analysis
- `RoadmapEntity` - Generated career roadmaps with progress tracking (streaks, completion %)
- `RoadmapTaskEntity` - Individual roadmap tasks across 3 phases (immediate/short/mid-term)
- `UserTodoEntity` - Personal todo system with priorities, categories, and roadmap linking
- `TodoReminderEntity` - Reminder system for todos (future implementation)
- `AIModelConfigEntity` - Dynamic AI model configuration (OpenRouter models)
- `AIUsageLogEntity` - AI usage tracking for cost analysis and performance metrics

### AI Integration (OpenRouter + Vercel AI SDK)

**Multi-Provider Setup**: Uses OpenRouter as unified gateway to access OpenAI, Anthropic, Google, Meta models through a single API.

**Key Files**:
- `src/lib/ai-config.ts` - OpenRouter client, model configs, cost calculation
- `src/lib/ai-model-service.ts` - Database-backed model selection and usage logging
- `src/app/actions.tsx` - Server actions for AI operations (career analysis)

**AI Flow**:
1. System prompts stored in `CareerRoleEntity` define assessment behavior
2. `analyzeCareerAssessment()` builds conversation from Q&A pairs
3. Vercel AI SDK's `generateText()` uses dynamically selected model
4. Response parsed by `parse-roadmap.ts` into structured phases/tasks
5. Usage automatically logged to `AIUsageLogEntity` with cost tracking

**Model Selection Priority**:
1. Database `AIModelConfigEntity` (if default model marked)
2. `DEFAULT_AI_MODEL` env var
3. Fallback to `openai/gpt-4o-mini`

### Authentication (Clerk)

**Middleware**: `src/middleware.ts` protects all routes except:
- `/`, `/sign-in`, `/sign-up`, `/careers`, `/pricing`
- `/api/careers`, `/api/seed`, `/api/test-db`, `/api/webhooks/*`

**User Sync**: Clerk webhooks (`/api/webhooks/clerk/route.ts`) auto-create/update `UserEntity` records.

**Admin System**:
- `src/lib/admin-guard.ts` provides `requireAdmin()`, `checkIsAdmin()`, `getCurrentUser()`
- Admin routes under `/admin/*` and `/api/admin/*`
- Promote admins: `pnpm promote:admin` or database direct

### Assessment & Roadmap Flow

1. **Career Selection** (`/careers`) - User selects from 3 AI career paths
2. **Assessment** (`/assessment/start/[roleId]`) - 8-question flow with auto-save
3. **AI Analysis** - GPT analyzes responses using role-specific system prompt
4. **Verdict** (`/assessment/[assessmentId]/results`) - Match score (0-100%), timeline, gaps
5. **Roadmap Generation** - AI output parsed into 3 phases with tasks
6. **Progress Tracking** (`/roadmap/[roadmapId]`) - Task completion, streaks, notes

**Key Parsing Logic** (`src/lib/parse-roadmap.ts`):
- Extracts phases: "Immediate (30 days)", "3-6 Month", "6-12 Month"
- Parses tasks with priority (CRITICAL/HIGH/NORMAL/LOW)
- Extracts estimated hours and resource links

### Todo System (Phases 1-2 Complete)

**Status**: Backend complete, frontend Phase 3 pending.

**API Endpoints**:
- `GET /api/todos` - List with filters, search, sort, pagination
- `POST /api/todos` - Create new todo
- `GET /api/todos/[id]` - Get single todo
- `PUT /api/todos/[id]` - Update todo
- `DELETE /api/todos/[id]` - Archive or permanently delete
- `GET /api/todos/stats` - Comprehensive statistics (13 metrics)
- `POST /api/todos/from-roadmap` - Convert roadmap task to todo
- `GET /api/todos/from-roadmap` - Get todos for a roadmap

**Categories**: `ai_suggested`, `personal_upskilling`, `general`
**Priorities**: `critical`, `high`, `normal`, `low`
**Status Flow**: `pending` → `in_progress` → `completed` → `archived`

**Validation**: All schemas in `src/lib/validations/todo.ts` (Zod)
**Helpers**: `src/lib/todo-helpers.ts` (query building, stats, formatting)

### Frontend Structure (Next.js App Router)

```
src/app/
├── (public routes)
│   ├── page.tsx                    # Landing page
│   ├── careers/                    # Career selection
│   └── pricing/                    # Pricing page
├── (auth routes - Clerk)
│   ├── sign-in/[[...sign-in]]/     # Clerk sign-in
│   └── sign-up/[[...sign-up]]/     # Clerk sign-up
├── (protected routes)
│   ├── dashboard/                  # User dashboard with todos widget
│   ├── onboarding/                 # Post-signup flow
│   ├── assessment/                 # Assessment flow
│   │   ├── start/[roleId]/         # Take assessment
│   │   └── [assessmentId]/results/ # View results
│   ├── roadmap/[roadmapId]/        # Roadmap progress
│   └── dashboard/todos/            # Todo management (Phase 3 - partial)
└── (admin routes - requires isAdmin=true)
    ├── admin/
    │   ├── page.tsx                # Admin dashboard
    │   ├── models/                 # AI model management
    │   ├── users/                  # User management
    │   └── analytics/              # Usage analytics
    └── api/admin/
        ├── models/                 # Model CRUD APIs
        ├── users/                  # User management APIs
        └── usage/                  # Usage statistics API
```

**Components** (`src/components/`):
- `ui/` - shadcn/ui components (button, card, input, etc.)
- `career/CareerRoleCard.tsx` - Career path selection cards
- `todos/TodoForm.tsx` - Todo create/edit form
- `todos/TodoWidget.tsx` - Dashboard todo widget
- `header.tsx` - Navigation with Clerk UserButton

## Common Development Patterns

### Creating New API Routes

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data-source";
import { UserEntity } from "@/entities/UserEntity";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repo = await getRepository(UserEntity);
  const user = await repo.findOne({ where: { clerkUserId: userId } });

  return NextResponse.json({ user });
}
```

### Using AI Generation

```typescript
import { generateText } from "ai";
import { getModel } from "@/lib/ai-config";
import { getDefaultModel, logAIUsage } from "@/lib/ai-model-service";

const modelConfig = await getDefaultModel();
const result = await generateText({
  model: getModel(modelConfig?.modelId || "openai/gpt-4o-mini"),
  messages: [...],
  temperature: 0.7,
});

// Usage automatically logged by actions.tsx
```

### Admin Route Protection

```typescript
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const { user, error } = await requireAdmin();
  if (error) return error;

  // Admin-only logic here
}
```

## Environment Variables

**Required**:
```bash
# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# AI (OpenRouter provides access to all providers)
OPENROUTER_API_KEY="sk-or-..."
```

**Optional**:
```bash
# Override default model (defaults to openai/gpt-4o-mini)
DEFAULT_AI_MODEL="anthropic/claude-3.5-sonnet"

# Database logging
DATABASE_LOGGING="true"

# App URL for OpenRouter tracking
NEXT_PUBLIC_APP_URL="https://yourapp.netlify.app"
```

## Deployment (Netlify)

**Configuration**: `netlify.toml` pre-configured for Next.js 14

**Key Settings**:
- Uses `@netlify/plugin-nextjs`
- External modules: typeorm, pg, sqlite3
- Increased function timeout for database operations
- Webhook redirects configured

**Build Process**:
1. Push to GitHub
2. Import to Netlify
3. Add environment variables in Netlify dashboard
4. Auto-deploy on push to master

**Post-Deploy**:
- Visit `/api/seed` to seed career roles
- Run `pnpm promote:admin` with first user's Clerk ID

## Database Migrations

**Development**: `synchronize: true` auto-creates tables
**Production**: Use TypeORM migrations in `src/migrations/`

**Migration Structure**:
```
src/migrations/
├── 1700000000000-CreateUserTodoTables.ts
└── README.md  # Migration guide
```

## Important Notes

### TypeORM Caveats
- **Never** call `DataSource.initialize()` directly in API routes
- **Always** use `getRepository()` helper to get entity repos
- Connection pooling configured for serverless (10 max, 30s idle timeout)
- In production, `synchronize: false` (use migrations)

### Clerk Integration
- User records auto-created via webhooks on sign-up
- `clerkUserId` is the bridge between Clerk and our database
- Always use `await auth()` for authentication, never client-side tokens

### AI Cost Management
- All AI calls automatically logged to `AIUsageLogEntity`
- Cost calculated using model pricing from `PREDEFINED_MODELS`
- Track usage via `/admin/analytics`
- Models configurable via `/admin/models` without redeployment

### Todo System Implementation Status
- ✅ Phase 1: Database entities complete
- ✅ Phase 2: API routes complete
- ⏳ Phase 3: Frontend components (partial - widget exists, full UI pending)
- ⏳ Phase 4: AI chat extraction (planned)
- ⏳ Phase 5: Advanced features (planned)

## Troubleshooting

**Database connection issues**: Check DATABASE_URL SSL settings, NeonDB requires `sslmode=require`

**TypeORM entity not found**: Ensure entity is added to `entities` array in `src/lib/data-source.ts`

**Clerk webhook failures**: Verify CLERK_WEBHOOK_SECRET matches Clerk dashboard and `/api/webhooks/clerk` is publicly accessible

**AI generation errors**: Check OPENROUTER_API_KEY validity and account credit balance at https://openrouter.ai

**Admin access issues**: Use `pnpm promote:admin` script with correct Clerk user ID, or manually set `isAdmin=true` in database
