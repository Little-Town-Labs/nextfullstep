# NextFullStep MVP Testing Guide

**Date**: 2025-10-14
**Purpose**: Step-by-step guide to test the NeonDB migration and career selection UI

---

## Prerequisites

1. ✅ NeonDB connection string in `.env`
2. ✅ `pg` package added to `package.json`
3. ✅ TypeORM configured for PostgreSQL
4. ⏳ Dependencies installed (`pnpm install`)

---

## Testing Steps

### Step 1: Install Dependencies

```bash
cd "G:\Development Projects\NextFullStep\nextfullstep"
pnpm install
```

**Expected Output**:
- `pg@8.11.3` installed
- No errors
- Lock file updated

**Troubleshooting**:
- If you see "virtual-store-dir-max-length" error, confirm with "Y" when prompted
- If installation fails, try: `pnpm install --force`

---

### Step 2: Start Development Server

```bash
pnpm dev
```

**Expected Output**:
```
> nextjs-ai-lite@0.1.0 dev
> next dev

   ▲ Next.js 14.2.5
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

**Troubleshooting**:
- If port 3000 is busy: `pnpm dev -- -p 3001`
- If TypeScript errors appear, continue (will fix during testing)

---

### Step 3: Test Database Connection

**Visit**: http://localhost:3000/api/test-db

**Expected Response**:
```json
{
  "success": true,
  "message": "✅ Connected to NeonDB successfully",
  "connection": {
    "type": "postgres",
    "database": "neondb",
    "host": "ep-red-cherry-a5g07x71-pooler.us-east-2.aws.neon.tech",
    "isConnected": true
  },
  "server": {
    "currentTime": "2025-10-14T12:34:56.789Z",
    "postgresVersion": "PostgreSQL 16.x on x86_64-pc-linux-gnu..."
  }
}
```

**✅ Success**: Database connection working!
**❌ Error**: See troubleshooting section below

---

### Step 4: Seed Career Roles

**Visit**: http://localhost:3000/api/seed

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

**What This Does**:
- Creates all database tables (users, career_roles, career_assessments, etc.)
- Inserts 3 career role records with complete system prompts
- Safe to run multiple times (updates existing records)

**Check Console Output**:
```
Database connection initialized
Created career role: AI Prompt Engineer
Created career role: AI Content Creator
Created career role: AI Coach
✅ Career roles seeded successfully
```

---

### Step 5: Test Careers API

**Visit**: http://localhost:3000/api/careers

**Expected Response**:
```json
{
  "success": true,
  "count": 3,
  "roles": [
    {
      "id": "ai-prompt-engineer",
      "name": "AI Prompt Engineer",
      "shortDescription": "Craft effective prompts to get better AI outputs...",
      "category": "Content & Communication",
      "accessibilityLevel": "High",
      "typicalTimeline": "1-6 months",
      "avgStartingSalary": "$45K-$70K",
      "freelanceRate": "$30-$150/hr",
      "growthRate": "High",
      "remoteOpportunity": "Excellent"
    },
    {
      "id": "ai-content-creator",
      "name": "AI Content Creator",
      "shortDescription": "Create high-quality content using AI tools...",
      "category": "Content & Communication",
      "accessibilityLevel": "High",
      "typicalTimeline": "1-6 months",
      "avgStartingSalary": "$45K-$65K",
      "freelanceRate": "$30-$120/hr",
      "growthRate": "Very High",
      "remoteOpportunity": "Excellent"
    },
    {
      "id": "ai-coach",
      "name": "AI Coach",
      "shortDescription": "Train teams and individuals on effective AI tool adoption...",
      "category": "Training & Enablement",
      "accessibilityLevel": "Medium",
      "typicalTimeline": "2-8 months",
      "avgStartingSalary": "$60K-$85K",
      "freelanceRate": "$75-$250/hr",
      "growthRate": "Explosive (+57.7% YoY)",
      "remoteOpportunity": "Good"
    }
  ]
}
```

---

### Step 6: Test Career Selection UI

**Visit**: http://localhost:3000

**Expected Behavior**:
1. **Home page** redirects to `/careers` automatically
2. **Careers page** displays:
   - Header: "Find Your AI Career Path"
   - Stats banner: "8 Questions | 5-10 Minutes | Custom Roadmap"
   - **3 career role cards** in a grid layout
   - Each card shows:
     - Role name and accessibility badge (High/Medium)
     - Short description
     - Timeline, Growth Rate, Salary, Freelance Rate
     - Category and Remote Opportunity tags
     - "Start Assessment →" button
   - "How It Works" section with 4 steps

**Visual Check**:
- ✅ Cards have hover shadow effect
- ✅ Accessibility badges are color-coded (green for High, yellow for Medium)
- ✅ Responsive layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- ✅ Blue gradient background (blue-50 to white)

---

### Step 7: Verify NeonDB Console

**Option A: Web Console**
1. Visit: https://console.neon.tech
2. Log in to your Neon account
3. Navigate to your project
4. Click "SQL Editor"
5. Run queries:

```sql
-- List all tables
\dt

-- View career roles
SELECT id, name, accessibility_level, growth_rate
FROM career_roles
ORDER BY sort_order;

-- Expected: 3 rows returned
```

**Option B: CLI (psql)**
```bash
psql 'postgresql://neondb_owner:npg_qDyPj6h1kBuM@ep-red-cherry-a5g07x71-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
```

Then run:
```sql
-- List tables
\dt

-- Count career roles
SELECT COUNT(*) FROM career_roles;

-- View role details
SELECT * FROM career_roles LIMIT 1;
```

**Expected Tables**:
- `users`
- `career_roles`
- `career_assessments`
- `roadmaps`
- `roadmap_tasks`
- `ai_coaching_prompts`
- `bigfive_results`

---

## Troubleshooting

### Error: "Failed to connect to NeonDB"

**Possible Causes**:
1. DATABASE_URL not set correctly
2. NeonDB project is sleeping/inactive
3. Network/firewall blocking connection

**Solutions**:
```bash
# 1. Check environment variable
cat .env | grep DATABASE_URL

# Should show:
# DATABASE_URL="postgresql://neondb_owner:npg_qDyPj6h1kBuM@..."

# 2. Test connection directly with psql
psql 'postgresql://neondb_owner:npg_qDyPj6h1kBuM@ep-red-cherry-a5g07x71-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require' -c "SELECT NOW();"

# 3. Wake up NeonDB project by visiting console
# Visit: https://console.neon.tech (opens project)
```

---

### Error: "SSL connection required"

**Solution**: Already configured in `data-source.ts`:
```typescript
ssl: {
  rejectUnauthorized: false,
}
```

If still errors, check that `?sslmode=require` is in DATABASE_URL.

---

### Error: "Cannot find module 'pg'"

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install

# Or manually install pg
pnpm add pg
```

---

### Error: "No roles found" on careers page

**Possible Causes**:
1. Seed script not run
2. Database tables not created
3. `isActive` flag set to false

**Solutions**:
```bash
# 1. Run seed script
curl http://localhost:3000/api/seed

# 2. Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM career_roles;"

# 3. If count is 0, re-run seed:
curl http://localhost:3000/api/seed

# 4. Check isActive flag
psql $DATABASE_URL -c "SELECT id, name, is_active FROM career_roles;"
```

---

### Error: "Table does not exist"

**Cause**: Tables not auto-created (synchronize failed)

**Solution**:
```bash
# Force table creation by hitting any API route
curl http://localhost:3000/api/seed

# Or manually create tables (use TypeORM CLI)
# But synchronize:true should handle this automatically
```

---

### Error: Build/TypeScript errors

**Common Issues**:

1. **"Cannot find module '@/components/career/CareerRoleCard'"**
   - File should exist at: `src/components/career/CareerRoleCard.tsx`
   - Check file was created correctly

2. **"Property 'xyz' does not exist"**
   - Restart TypeScript server: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

3. **Path alias '@/' not resolving**
   - Check `tsconfig.json` has:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

---

## Visual Testing Checklist

### Careers Page (`/careers`)
- [ ] Header displays "Find Your AI Career Path"
- [ ] Description text is centered
- [ ] Stats banner shows 3 columns with icons
- [ ] 3 career cards display in grid
- [ ] Cards have proper spacing (gap-6)
- [ ] Each card shows all fields:
  - [ ] Name and accessibility badge
  - [ ] Short description
  - [ ] 4 stats boxes (Timeline, Growth, Salary, Freelance)
  - [ ] Category and Remote tags
  - [ ] "Start Assessment" button
- [ ] Hover effect on cards (shadow increases)
- [ ] "How It Works" section with 4 numbered steps
- [ ] Responsive on mobile (cards stack vertically)

### Card Colors
- [ ] High accessibility: Green badge
- [ ] Medium accessibility: Yellow badge
- [ ] Stats boxes: Gray background (bg-gray-50)
- [ ] Button: Blue (bg-blue-600)

---

## Performance Checks

### Page Load Time
- **Target**: < 1 second for careers page
- **Measure**: Browser DevTools → Network tab

### API Response Time
- **Target**:
  - `/api/careers`: < 200ms
  - `/api/seed`: < 500ms (creates tables)
  - `/api/test-db`: < 100ms

### Database Query Time
- Check NeonDB console → Monitoring
- All queries should be < 50ms

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Verify database connection works
2. ✅ Confirm career roles seeded
3. ✅ Check careers page displays correctly
4. ⏳ Build assessment flow (`/assessment/[roleId]`)
5. ⏳ Integrate GPT-4o-mini for analysis
6. ⏳ Build roadmap display
7. ⏳ Create user dashboard

---

## Test Summary Report Template

After completing tests, document results:

```markdown
# Test Results - [Date]

## Database Connection
- [x] NeonDB connection successful
- [x] Tables created automatically
- [x] Career roles seeded (3 roles)

## API Routes
- [x] GET /api/test-db - Returns connection status
- [x] GET /api/careers - Returns 3 career roles
- [x] GET /api/seed - Seeds database successfully

## UI Components
- [x] Home page redirects to /careers
- [x] Careers page loads without errors
- [x] 3 career role cards display correctly
- [x] Hover effects work
- [x] Responsive layout on mobile

## Performance
- /api/careers response time: [X]ms
- Careers page load time: [X]s
- Database query time: [X]ms

## Issues Found
- [List any issues]

## Status
✅ Ready for next phase (Assessment Flow)
```

---

**Good luck with testing! 🚀**

If you encounter any issues not covered here, check:
1. Browser console for JavaScript errors
2. Terminal for server errors
3. NeonDB console for database errors
4. [ProjectDocs/neondb-migration.md](neondb-migration.md) for migration details
