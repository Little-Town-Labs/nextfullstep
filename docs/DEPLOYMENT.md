# Netlify Deployment Guide

This guide walks you through deploying your Next.js application to Netlify.

## Prerequisites

Before deploying, ensure you have:

1. A [Netlify account](https://app.netlify.com/signup)
2. A [NeonDB PostgreSQL database](https://neon.tech) (already configured)
3. [Clerk authentication](https://clerk.com) credentials
4. OpenAI and OpenRouter API keys
5. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

Ensure all recent changes are committed:

```bash
git add .
git commit -m "feat: Configure for Netlify deployment"
git push origin master
```

## Step 2: Connect to Netlify

### Option A: Using Netlify UI

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository: `nextfullstep`
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Base directory:** (leave empty)

### Option B: Using Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify site (from project root)
netlify init

# Deploy
netlify deploy --prod
```

## Step 3: Configure Environment Variables

In the Netlify dashboard, go to **Site settings** → **Environment variables** and add:

### Required Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxx

# Database (NeonDB PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-red-cherry-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Clerk URLs (adjust domain after first deploy)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Environment
NODE_ENV=production
NEXT_RUNTIME=netlify
```

### Optional Variables

```bash
# Enable database query logging (for debugging)
DATABASE_LOGGING=false

# Your Netlify app URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://your-app.netlify.app
```

## Step 4: Install Netlify Next.js Plugin

The `netlify.toml` file already includes the Next.js plugin configuration. Netlify will automatically detect and install it during deployment.

If you need to install it manually:

```bash
npm install -D @netlify/plugin-nextjs
```

## Step 5: Configure Clerk Webhooks

After your first successful deployment:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** in the sidebar
3. Click **"Add Endpoint"**
4. Set the endpoint URL: `https://your-app.netlify.app/api/webhooks/clerk`
5. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copy the **Signing Secret** and add it to Netlify as `CLERK_WEBHOOK_SECRET`

## Step 6: Deploy!

### First Deployment

1. Click **"Deploy site"** in Netlify UI, or
2. Run `netlify deploy --prod` from CLI

Netlify will:
- Install dependencies
- Build your Next.js application
- Deploy to a production URL
- Provide you with a live URL (e.g., `https://your-app.netlify.app`)

### Subsequent Deployments

Every push to your `master` branch will automatically trigger a new deployment.

## Step 7: Verify Deployment

After deployment completes:

1. **Test the home page:** `https://your-app.netlify.app`
2. **Test authentication:** Try signing up/in
3. **Test API routes:**
   - `https://your-app.netlify.app/api/test-db` - Should return database info
   - `https://your-app.netlify.app/api/careers` - Should return career data
4. **Check database connection:** Verify database tables are created in NeonDB dashboard

## Step 8: Custom Domain (Optional)

To use your own domain:

1. In Netlify: **Domain settings** → **Add custom domain**
2. Follow DNS configuration instructions
3. Update Clerk allowed origins to include your custom domain
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Troubleshooting

### Build Failures

**Issue:** Build fails with "Cannot find module 'typeorm'"
- **Solution:** Check that `netlify.toml` includes TypeORM in `external_node_modules`

**Issue:** Build fails with database connection errors
- **Solution:** Database connections during build are expected to fail. The app connects at runtime, not build time.

### Runtime Issues

**Issue:** 500 errors on API routes
- **Solution:** Check Netlify Function logs: **Site overview** → **Functions** → Select function → **Logs**
- Verify all environment variables are set correctly
- Check DATABASE_URL format includes `?sslmode=require`

**Issue:** Clerk authentication not working
- **Solution:**
  - Verify all Clerk environment variables are set
  - Check Clerk Dashboard domain settings include your Netlify URL
  - Ensure webhook endpoint is accessible

**Issue:** Database tables not created
- **Solution:**
  - Database synchronization is disabled in production
  - Tables should be created in your NeonDB database beforehand
  - You can temporarily enable synchronization by setting a `DATABASE_SYNC=true` env var and updating [data-source.ts:28](src/lib/data-source.ts#L28)

### Viewing Logs

```bash
# Using Netlify CLI
netlify logs --live

# Or in Netlify Dashboard:
# Site overview → Functions → Select function → Logs
```

## Database Management

### Running Migrations (Future)

When you add migrations to production:

1. Update [data-source.ts](src/lib/data-source.ts) to include migration files
2. Create a migration:
   ```bash
   npx typeorm migration:create src/migrations/MigrationName
   ```
3. Deploy and migrations will run automatically on first connection

### Database Schema

Current tables (auto-created via synchronize in production):
- `users` - User accounts (synced with Clerk)
- `career_roles` - Career role definitions
- `career_assessments` - User career assessments
- `roadmaps` - Learning roadmaps
- `roadmap_tasks` - Tasks within roadmaps
- `user_todos` - User todo items
- `todo_reminders` - Reminder notifications for todos

## Monitoring

### Performance Monitoring

Netlify provides built-in analytics:
- Go to **Analytics** in your site dashboard
- Monitor function execution times
- Track error rates

### Database Monitoring

Monitor your NeonDB instance:
- Check connection pool usage
- Monitor query performance
- Review storage usage

## Scaling Considerations

### Function Timeouts

Netlify functions have a 10-second timeout on the free tier (26 seconds on Pro). If you need longer:
1. Upgrade to Netlify Pro
2. Or optimize long-running operations
3. Or use background functions for async tasks

### Database Connection Pooling

The app is configured with connection pooling optimized for serverless:
- Max connections: 10
- Min connections: 2
- Idle timeout: 30 seconds

Adjust in [data-source.ts:42-47](src/lib/data-source.ts#L42-L47) if needed.

### Cold Starts

First request after inactivity may be slower due to:
- Function cold start
- Database connection initialization

Consider implementing:
- Scheduled functions to keep instance warm
- Connection caching strategies
- Loading states in UI

## Security Checklist

- [ ] All environment variables are set in Netlify (not committed to Git)
- [ ] `.env` files are in `.gitignore`
- [ ] Clerk webhook secret is configured
- [ ] Database uses SSL connection (`?sslmode=require`)
- [ ] API routes are protected with Clerk middleware
- [ ] CORS headers are properly configured
- [ ] Sensitive data is not logged in production

## CI/CD Pipeline

Your deployment pipeline:

```
Git Push → Netlify Build → Deploy → Live
    ↓
  master branch
    ↓
  Automatic deployment
    ↓
  Preview deployments for PRs (optional)
```

### Branch Previews

Enable deploy previews for branches:
1. **Site settings** → **Build & deploy** → **Deploy contexts**
2. Enable **Deploy Preview** for pull requests
3. Each PR gets a unique preview URL

## Rollback

To rollback to a previous deployment:

1. Go to **Deploys** in Netlify dashboard
2. Find the working deployment
3. Click **"⋮"** → **"Publish deploy"**

Or via CLI:
```bash
netlify rollback
```

## Cost Estimation

### Netlify (Free Tier)

- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- **Cost:** Free

### NeonDB (Free Tier)

- 512 MB storage
- Shared compute
- Auto-suspend after inactivity
- **Cost:** Free (upgrade for production use)

### Clerk (Free Tier)

- 10,000 monthly active users
- **Cost:** Free

## Next Steps

After successful deployment:

1. Set up custom domain
2. Configure DNS
3. Enable HTTPS (automatic with Netlify)
4. Set up monitoring/alerting
5. Configure branch previews
6. Set up staging environment
7. Implement database backup strategy

## Support

- **Netlify Docs:** https://docs.netlify.com
- **Next.js on Netlify:** https://docs.netlify.com/frameworks/next-js/
- **Netlify Community:** https://answers.netlify.com
- **Project Issues:** https://github.com/your-repo/issues

---

**Happy deploying! 🚀**
