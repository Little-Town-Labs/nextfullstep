# GitHub Repository Setup Guide

This guide will walk you through setting up a GitHub repository for NextFullStep and pushing your code.

---

## Prerequisites

- Git installed locally ✅ (Already initialized)
- GitHub account
- Initial commit completed ✅

---

## Step-by-Step Instructions

### 1. Create a New Repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in repository details:
   - **Repository name**: `nextfullstep` (or your preferred name)
   - **Description**: "AI-Powered Career Transition Platform - Get personalized assessments, honest verdicts, and actionable roadmaps for AI careers"
   - **Visibility**: Choose **Public** or **Private**
   - **❌ DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

---

### 2. Connect Your Local Repository to GitHub

GitHub will show you setup instructions. Use the **"…or push an existing repository from the command line"** section:

```bash
cd "G:\Development Projects\NextFullStep\nextfullstep"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/nextfullstep.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

---

### 3. Verify Upload

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/nextfullstep`
2. You should see:
   - 227 files committed
   - README.md displayed on the homepage
   - All source code in `src/` folder
   - `.env` file is **NOT** visible (correctly ignored)

---

## Alternative: Using GitHub CLI

If you have [GitHub CLI](https://cli.github.com/) installed:

```bash
cd "G:\Development Projects\NextFullStep\nextfullstep"

# Create repo and push in one command
gh repo create nextfullstep --public --source=. --remote=origin --push
```

---

## Important Notes

### 🔐 Environment Variables

Your `.env` file is automatically ignored by Git (listed in `.gitignore`).

**Never commit your `.env` file!** It contains sensitive information:
- `OPENAI_API_KEY`
- `DATABASE_URL` with credentials

When collaborators clone the repo, they need to:
1. Copy `.env.example` to `.env`
2. Fill in their own API keys and database credentials

---

### 📝 Repository Settings (Recommended)

After creating your repo, configure these settings on GitHub:

#### About Section
1. Go to repository homepage
2. Click **⚙️ gear icon** next to "About"
3. Add:
   - **Description**: "AI-Powered Career Transition Platform"
   - **Website**: Your deployed URL (once live)
   - **Topics**: `nextjs`, `typescript`, `ai`, `career`, `openai`, `gpt4`, `postgresql`, `neondb`

#### Branch Protection (Optional, for teams)
1. Go to **Settings** → **Branches**
2. Add branch protection rule for `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

---

## Deployment to Vercel from GitHub

Once your code is on GitHub, deploying to Vercel is automatic:

### 1. Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Select your `nextfullstep` repository

### 2. Configure Project

Vercel will auto-detect Next.js:
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `pnpm build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### 3. Add Environment Variables

Before deploying, add your secrets:

```
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

### 4. Deploy!

Click **"Deploy"** and wait ~2 minutes.

You'll get a production URL like: `https://nextfullstep.vercel.app`

### 5. Seed Production Database

Visit: `https://nextfullstep.vercel.app/api/seed` to create the 3 career roles.

---

## Git Workflow Going Forward

### Daily Work

```bash
# Make changes to your code
# ...

# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "Add dashboard page with user statistics"

# Push to GitHub
git push origin main
```

### Feature Branches (Recommended)

```bash
# Create a new feature branch
git checkout -b feature/user-dashboard

# Make changes and commit
git add .
git commit -m "Add user dashboard"

# Push feature branch
git push origin feature/user-dashboard

# Create Pull Request on GitHub
# After review and merge, delete branch
git checkout main
git pull origin main
git branch -d feature/user-dashboard
```

---

## Useful Git Commands

```bash
# View commit history
git log --oneline

# View current branch
git branch

# View remote URLs
git remote -v

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- .

# Pull latest from GitHub
git pull origin main

# View file changes
git diff

# Stash changes temporarily
git stash
git stash pop
```

---

## Collaboration

### Adding Collaborators

1. Go to **Settings** → **Collaborators**
2. Click **"Add people"**
3. Enter GitHub username
4. They'll receive an email invitation

### Pull Request Workflow

1. Collaborator forks or branches
2. Makes changes
3. Pushes to their branch
4. Opens Pull Request
5. You review → approve/request changes
6. Merge to `main`

---

## GitHub Actions (CI/CD) - Optional

Create `.github/workflows/ci.yml` for automated testing:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - uses: pnpm/action-setup@v2
      with:
        version: 8
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'

    - run: pnpm install
    - run: pnpm run build
    - run: pnpm run lint
```

---

## Backup & Recovery

Your code is now safely backed up on GitHub!

**To clone on another machine:**
```bash
git clone https://github.com/YOUR_USERNAME/nextfullstep.git
cd nextfullstep
pnpm install
# Copy .env.example to .env and fill in credentials
pnpm dev
```

---

## Repository Structure on GitHub

```
YOUR_USERNAME/nextfullstep
├── .github/              # GitHub Actions workflows (optional)
├── ProjectDocs/          # Documentation
├── ResultsData/          # Sample data
├── archive/              # Archived files
├── src/                  # Source code
├── public/               # Static assets
├── .gitignore            # Git ignore rules
├── README.md             # Project readme
├── GITHUB_SETUP.md       # This file
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── ...
```

---

## Support

- **GitHub Docs**: [docs.github.com](https://docs.github.com)
- **Git Cheat Sheet**: [git-scm.com/docs](https://git-scm.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---

**Ready to Share Your Code!** 🚀

Your NextFullStep MVP is now version-controlled and ready for collaboration, deployment, and the world to see!

---

## Quick Checklist

- [x] Git initialized locally
- [x] Initial commit made (227 files)
- [x] .gitignore configured (`.env` excluded)
- [x] README.md created
- [ ] GitHub repository created
- [ ] Remote added and code pushed
- [ ] Repository settings configured
- [ ] Deployed to Vercel (optional)
- [ ] Production database seeded (optional)

---

**Next Steps**: Follow Step 1 above to create your GitHub repository!
