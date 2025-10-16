# Netlify Deployment Checklist

Use this checklist to ensure a smooth deployment to Netlify.

## Pre-Deployment Checklist

### 1. Code Preparation
- [x] `netlify.toml` configuration file created
- [x] `next.config.mjs` updated with serverless output settings
- [x] Database connection configured for production
- [x] Environment variables documented
- [ ] All changes committed to Git
- [ ] Code pushed to remote repository (GitHub/GitLab/Bitbucket)

### 2. Environment Variables Ready
Gather these values before deploying:

#### Required API Keys
- [ ] `OPENAI_API_KEY` - Get from [OpenAI Dashboard](https://platform.openai.com/api-keys)
- [ ] `OPENROUTER_API_KEY` - Get from [OpenRouter Dashboard](https://openrouter.ai/keys)

#### Database
- [ ] `DATABASE_URL` - NeonDB PostgreSQL connection string from [Neon Console](https://console.neon.tech)
  - Format: `postgresql://user:pass@host/db?sslmode=require`

#### Clerk Authentication
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Get from [Clerk Dashboard](https://dashboard.clerk.com)
- [ ] `CLERK_SECRET_KEY` - Get from Clerk Dashboard
- [ ] `CLERK_WEBHOOK_SECRET` - Will configure after first deployment

#### Clerk URLs (use these defaults)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding`

#### Environment Settings
- [ ] `NODE_ENV=production`
- [ ] `NEXT_RUNTIME=netlify`

### 3. Database Preparation
- [ ] NeonDB database created
- [ ] Database URL connection string obtained
- [ ] Test database connection locally (run `npm run dev` and visit `/api/test-db`)

### 4. Clerk Configuration
- [ ] Clerk application created
- [ ] Allowed domains configured in Clerk (will update after deployment)
- [ ] API keys copied

## Deployment Steps

### Step 1: Push Code to Repository
```bash
git add .
git commit -m "feat: Configure for Netlify deployment"
git push origin master
```

### Step 2: Create Netlify Site

#### Option A: Netlify UI (Recommended for first-time)
1. [ ] Go to [app.netlify.com](https://app.netlify.com)
2. [ ] Click **"Add new site"** → **"Import an existing project"**
3. [ ] Connect your Git provider
4. [ ] Select repository: `nextfullstep`
5. [ ] Build settings should auto-detect:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. [ ] Click **"Deploy site"** (will fail without env vars - that's OK!)

#### Option B: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
# Follow prompts to connect repository
```

### Step 3: Configure Environment Variables
1. [ ] In Netlify Dashboard, go to **Site settings** → **Environment variables**
2. [ ] Click **"Add a variable"** for each required variable
3. [ ] Copy and paste values from your preparation
4. [ ] Ensure all variables are set for **Production** scope

**Tip:** Use [.env.production.example](.env.production.example) as your guide

### Step 4: Trigger Rebuild
1. [ ] Go to **Deploys** tab
2. [ ] Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. [ ] Wait for build to complete (typically 2-5 minutes)
4. [ ] Note your site URL (e.g., `https://yourapp-12345.netlify.app`)

### Step 5: Configure Clerk Webhook
1. [ ] Copy your Netlify site URL
2. [ ] Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
3. [ ] Click **"Add Endpoint"**
4. [ ] Enter webhook URL: `https://your-site.netlify.app/api/webhooks/clerk`
5. [ ] Subscribe to events:
   - [x] `user.created`
   - [x] `user.updated`
   - [x] `user.deleted`
6. [ ] Copy the **Signing Secret**
7. [ ] Add `CLERK_WEBHOOK_SECRET` to Netlify environment variables
8. [ ] Trigger another deploy to apply the new variable

### Step 6: Update Clerk Domain Settings
1. [ ] In Clerk Dashboard → **Settings** → **Domains**
2. [ ] Add your Netlify domain to allowed domains
3. [ ] Update **Authorized origins** with your Netlify URL

### Step 7: Verify Deployment
Test these endpoints:

- [ ] Home page: `https://your-site.netlify.app/`
- [ ] Database test: `https://your-site.netlify.app/api/test-db`
- [ ] Careers API: `https://your-site.netlify.app/api/careers`
- [ ] Sign in page: `https://your-site.netlify.app/sign-in`
- [ ] Try creating an account and signing in

### Step 8: Database Tables
Since `synchronize` is disabled in production:

**Option A: Enable temporary sync (Quick)**
1. [ ] Add environment variable: `DATABASE_SYNC=true` in Netlify
2. [ ] Update [src/lib/data-source.ts:28](src/lib/data-source.ts#L28):
   ```typescript
   synchronize: !isProduction || process.env.DATABASE_SYNC === 'true',
   ```
3. [ ] Deploy
4. [ ] Visit any API route to trigger DB initialization
5. [ ] Remove `DATABASE_SYNC` variable
6. [ ] Revert code change

**Option B: Manual SQL (Production-ready)**
1. [ ] Connect to NeonDB via SQL editor
2. [ ] Run migration SQL from [src/migrations/1700000000000-CreateUserTodoTables.ts](src/migrations/1700000000000-CreateUserTodoTables.ts)
3. [ ] Let TypeORM create other tables automatically on first connect

## Post-Deployment

### Optional: Custom Domain
- [ ] Purchase domain or use existing
- [ ] In Netlify: **Domain settings** → **Add custom domain**
- [ ] Configure DNS as instructed
- [ ] Update Clerk allowed domains
- [ ] Update `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Enable HTTPS (automatic with Netlify)

### Monitoring Setup
- [ ] Check **Analytics** in Netlify dashboard
- [ ] Review **Function logs** for any errors
- [ ] Monitor NeonDB usage in Neon Console
- [ ] Set up uptime monitoring (optional)

### Performance Optimization
- [ ] Review Netlify **Analytics** for slow pages
- [ ] Check database connection pool settings
- [ ] Consider Netlify Pro for better function limits

### Security Review
- [ ] All secrets in Netlify environment variables (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] Clerk webhook secret configured
- [ ] Database uses SSL connection
- [ ] API routes protected with Clerk middleware

## Troubleshooting

### Build Fails
**Check these common issues:**
- [ ] All required environment variables are set
- [ ] No typos in environment variable names
- [ ] Database URL includes `?sslmode=require`
- [ ] Node version is compatible (v18+)

**View build logs:**
- In Netlify: **Deploys** → Select deploy → **Deploy log**

### Runtime Errors (500)
**Check function logs:**
- Netlify Dashboard → **Functions** → Select function → **Logs**

**Common issues:**
- Database connection fails → Check DATABASE_URL format
- Clerk errors → Verify all Clerk env vars are set
- Module not found → Check external_node_modules in netlify.toml

### Authentication Not Working
- [ ] Clerk publishable key starts with `pk_live_` (not `pk_test_`)
- [ ] Netlify URL added to Clerk allowed domains
- [ ] Clerk URLs environment variables are set correctly

### Database Issues
- [ ] Tables exist in NeonDB (check via SQL editor)
- [ ] Connection string is correct
- [ ] NeonDB project is not suspended (free tier auto-suspends)
- [ ] SSL mode is enabled in connection string

## Rollback Plan

If deployment fails:
1. [ ] Go to **Deploys** in Netlify
2. [ ] Find last working deployment
3. [ ] Click **"⋮"** → **"Publish deploy"**

Or via CLI:
```bash
netlify rollback
```

## Support Resources

- **Netlify Docs:** https://docs.netlify.com
- **Netlify Support:** https://answers.netlify.com
- **Clerk Docs:** https://clerk.com/docs
- **NeonDB Docs:** https://neon.tech/docs
- **Full Guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Quick Command Reference

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod

# View logs
netlify logs --live

# Open site
netlify open:site

# Open admin
netlify open:admin
```

---

**Remember:** Your first deployment might fail - that's normal! Configure environment variables and trigger a rebuild.

**Good luck! 🚀**
