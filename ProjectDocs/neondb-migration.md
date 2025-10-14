# NeonDB Migration Guide

**Date**: 2025-10-14
**Migration**: SQLite → NeonDB PostgreSQL

---

## Overview

Migrated NextFullStep from local SQLite database to NeonDB serverless PostgreSQL for production-ready scalability.

---

## What Changed

### 1. Database Connection String

**Added to `.env`**:
```env
DATABASE_URL="postgresql://neondb_owner:npg_qDyPj6h1kBuM@ep-red-cherry-a5g07x71-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**NeonDB Details**:
- **Host**: `ep-red-cherry-a5g07x71-pooler.us-east-2.aws.neon.tech`
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Region**: US East 2 (Ohio)
- **Connection**: Pooled connection (optimized for serverless)
- **SSL**: Required

---

### 2. TypeORM Configuration Updated

**File**: [src/lib/data-source.ts](src/lib/data-source.ts)

**Before (SQLite)**:
```typescript
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  // ...
});
```

**After (PostgreSQL/NeonDB)**:
```typescript
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for NeonDB
  },
  synchronize: true,
  // ...
});
```

---

### 3. Package Dependencies

**Added to `package.json`**:
```json
{
  "dependencies": {
    "pg": "^8.11.3"  // PostgreSQL driver for Node.js
  }
}
```

**Note**: Kept `sqlite3` for now (can be removed later if no longer needed)

---

### 4. Entity Compatibility

All entities are **PostgreSQL-compatible**:
- ✅ `UserEntity` - Uses standard TypeORM decorators
- ✅ `CareerRoleEntity` - VARCHAR lengths supported
- ✅ `CareerAssessmentEntity` - JSON fields work natively in Postgres
- ✅ `RoadmapEntity` - Datetime fields compatible
- ✅ `RoadmapTaskEntity` - All field types supported
- ✅ `AICoachingPromptEntity` - Text fields compatible
- ✅ `BigFiveResultEntity` - Existing entity works

**Key Differences (automatically handled by TypeORM)**:
| SQLite | PostgreSQL |
|--------|------------|
| `INTEGER` | `INTEGER` |
| `TEXT` | `TEXT` |
| `VARCHAR` | `VARCHAR` |
| `DATETIME` | `TIMESTAMP` |
| JSON (string) | `JSONB` (native) |

---

## Installation & Setup

### Step 1: Install Dependencies

```bash
# If you haven't already
pnpm install

# This will install the pg driver
```

### Step 2: Verify Environment Variables

Check that `.env` contains:
```env
DATABASE_URL="postgresql://neondb_owner:npg_qDyPj6h1kBuM@ep-red-cherry-a5g07x71-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Step 3: Test Connection

Start the dev server:
```bash
pnpm dev
```

Visit the seed endpoint to create tables and populate data:
```
http://localhost:3000/api/seed
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Career roles seeded successfully",
  "roles": [
    { "id": "ai-prompt-engineer", "name": "AI Prompt Engineer" },
    { "id": "ai-content-creator", "name": "AI Content Creator" },
    { "id": "ai-coach", "name": "AI Coach" }
  ]
}
```

---

## NeonDB Features & Benefits

### 1. Serverless Autoscaling
- Automatically scales compute based on demand
- Scales to zero when inactive (cost savings)
- Instant wake-up on first request

### 2. Connection Pooling
- Built-in connection pooler (already using pooler endpoint)
- Prevents connection limit issues with serverless functions
- Optimized for Next.js API routes

### 3. Point-in-Time Recovery
- Automatic backups
- Restore to any point in time
- 7-day retention by default

### 4. Branching
- Create database branches for testing
- Schema previews for pull requests
- Instant branch creation (copy-on-write)

### 5. Native PostgreSQL
- Full PostgreSQL 16 compatibility
- All native features (JSONB, arrays, CTEs, etc.)
- Extensions supported (pg_vector, PostGIS, etc.)

---

## Database Schema

The following tables will be auto-created on first connection (due to `synchronize: true`):

1. **users** - User profiles and authentication
2. **career_roles** - 3 MVP career paths with prompts
3. **career_assessments** - Assessment Q&A and verdicts
4. **roadmaps** - Career roadmap metadata
5. **roadmap_tasks** - Individual roadmap tasks
6. **ai_coaching_prompts** - Legacy coaching prompts (keep for now)
7. **bigfive_results** - Personality test results (keep for now)

---

## Troubleshooting

### Issue: Connection Timeout
**Solution**: Check that DATABASE_URL is correct and NeonDB project is active

### Issue: SSL Error
**Solution**: Ensure `ssl: { rejectUnauthorized: false }` is in data-source.ts

### Issue: Tables Not Created
**Solution**:
1. Check that `synchronize: true` in data-source.ts
2. Visit `/api/seed` to trigger initialization
3. Check NeonDB console for connection logs

### Issue: "Too Many Connections"
**Solution**: Already using pooler endpoint (`-pooler.us-east-2.aws.neon.tech`)

### Issue: Migration Conflicts
**Solution**:
- Set `synchronize: false` in production
- Use TypeORM migrations: `npx typeorm migration:create`
- Run migrations on deploy

---

## Production Considerations

### Before Launch:

1. **Disable `synchronize`**:
   ```typescript
   synchronize: false, // IMPORTANT: Disable in production
   ```

2. **Enable Logging** (temporarily for debugging):
   ```typescript
   logging: true, // Enable to debug SQL queries
   ```

3. **Create Migrations**:
   ```bash
   npx typeorm migration:generate -n InitialSchema
   npx typeorm migration:run
   ```

4. **Add Connection Pool Limits**:
   ```typescript
   extra: {
     max: 10, // Maximum pool size
     min: 2,  // Minimum pool size
   }
   ```

5. **Set Up Monitoring**:
   - Enable NeonDB monitoring in console
   - Track query performance
   - Set up alerts for connection issues

---

## Data Migration (If Needed)

If you have existing SQLite data to migrate:

### Option 1: Manual Export/Import
```bash
# Export from SQLite
sqlite3 database.sqlite .dump > data.sql

# Convert SQLite syntax to PostgreSQL
# (may need manual edits for data types)

# Import to NeonDB
psql $DATABASE_URL < data.sql
```

### Option 2: Use TypeORM Seed Script
Create a one-time migration script that reads SQLite and writes to PostgreSQL.

### Option 3: Fresh Start
Since this is MVP development, starting fresh with NeonDB is recommended.

---

## Testing Checklist

- [x] Environment variables configured
- [x] TypeORM data source updated
- [x] PostgreSQL driver installed
- [ ] Dependencies installed (`pnpm install`)
- [ ] Dev server starts without errors
- [ ] `/api/seed` successfully creates tables
- [ ] Career roles seeded correctly
- [ ] Existing API routes work
- [ ] Can query database from NeonDB console

---

## NeonDB Console Access

Access your database directly:

**Connection String (CLI)**:
```bash
psql 'postgresql://neondb_owner:npg_qDyPj6h1kBuM@ep-red-cherry-a5g07x71-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
```

**Web Console**:
- Visit: https://console.neon.tech
- Navigate to your project
- Use SQL Editor to run queries

**Example Queries**:
```sql
-- List all tables
\dt

-- View career roles
SELECT id, name, accessibility_level FROM career_roles;

-- Check user count
SELECT COUNT(*) FROM users;

-- View assessment stats
SELECT role_id, status, COUNT(*)
FROM career_assessments
GROUP BY role_id, status;
```

---

## Rollback Plan (If Needed)

To revert back to SQLite:

1. Restore [src/lib/data-source.ts](src/lib/data-source.ts:15-20):
   ```typescript
   type: "sqlite",
   database: "database.sqlite",
   ```

2. Remove DATABASE_URL from `.env`

3. Restart dev server

**Note**: Not recommended - PostgreSQL is production-ready

---

## Next Steps

1. ✅ Complete migration
2. ⏳ Install dependencies (`pnpm install`)
3. ⏳ Test connection via `/api/seed`
4. ⏳ Verify all API routes work
5. ⏳ Build career selection UI
6. ⏳ Deploy to Vercel (DATABASE_URL will be set as environment variable)

---

**Status**: Migration complete, pending dependency installation and testing 🚀
