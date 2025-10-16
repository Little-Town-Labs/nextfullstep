# Admin Panel & OpenRouter Integration - Setup Guide

This document provides a complete guide for the new Admin Panel and OpenRouter AI integration.

## 🎉 What's New

### Admin Panel Features
- **AI Model Management** - Configure, enable/disable, and set default AI models
- **User Management** - Promote/demote admins, view user details
- **Usage Analytics** - Track AI usage, costs, and performance
- **Centralized Dashboard** - Overview of system statistics

### OpenRouter Integration
- **Multi-Provider Access** - Access models from OpenAI, Anthropic, Google, Meta, and more through a single API
- **Cost Tracking** - Automatic cost calculation and usage logging
- **Model Flexibility** - Switch models without code deployment
- **Better Rate Limits** - Improved rate limits vs direct provider APIs

---

## 📋 Setup Instructions

### 1. Environment Variables

Update your `.env` file with the following:

```bash
# ===================================
# AI Configuration
# ===================================

# OpenRouter API Key (Required for AI features)
# Get your key from: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Override default AI model
# DEFAULT_AI_MODEL=openai/gpt-4o-mini

# Optional: Your app URL for OpenRouter tracking
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get your OpenRouter API key:**
1. Visit https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Add credits to your account (min $5)

### 2. Database Setup

The database will automatically create new tables for:
- `ai_model_configs` - AI model configurations
- `ai_usage_logs` - Usage tracking and analytics
- `users` - Updated with `isAdmin` and `role` fields

**Important:** If you're using production, make sure to sync your database schema:

```bash
# Development (auto-sync enabled)
npm run dev

# Production (you may need to run migrations)
# Set synchronize: true temporarily or create migrations
```

### 3. Seed AI Models

Populate the database with predefined AI models:

```bash
npm run seed:models
```

This will create models for:
- **OpenAI**: GPT-4o, GPT-4o Mini
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku
- **Google**: Gemini Pro, Gemini Flash
- **Meta**: Llama 3.1 70B

**Default model:** GPT-4o Mini (cost-effective and fast)

### 4. Promote Your First Admin

Promote yourself to admin using your email:

```bash
npm run promote:admin your-email@example.com
```

**Important:** You must sign up for an account first before running this command.

### 5. Access the Admin Panel

Once promoted, visit:
```
http://localhost:3000/admin
```

---

## 🎯 Admin Panel Pages

### Dashboard (`/admin`)
- System statistics overview
- Recent AI activity
- Quick action links
- Usage and cost summary

### AI Models (`/admin/models`)
- **View all models** - See all configured AI models
- **Enable/Disable** - Toggle model availability
- **Set Default** - Choose which model to use for assessments
- **Delete Models** - Remove unused models
- **Cost Information** - View pricing per 1k tokens

**Key Features:**
- Real-time status indicators
- Usage count tracking
- Last used timestamps
- Provider badges

### Users (`/admin/users`)
- **List all users** - Paginated user list
- **Search users** - Filter by email or name
- **Promote/Demote** - Grant or revoke admin access
- **View details** - Subscription tier, usage, status

**Permissions:**
- Only admins can access this page
- Admins cannot demote themselves
- Email-based search

### Analytics (`/admin/analytics`)
- **Usage statistics** - Requests, tokens, cost
- **Date range filter** - Last 24h, 7d, 30d, 90d
- **Model breakdown** - Usage by model
- **Cost distribution** - Visual cost breakdown
- **Performance metrics** - Average latency

---

## 🚀 How It Works

### AI Request Flow

1. **User completes assessment** → Triggers AI analysis
2. **System fetches default model** from database (`ai_model_configs`)
3. **OpenRouter API called** with selected model
4. **Response parsed** and roadmap generated
5. **Usage logged** to `ai_usage_logs` table
6. **Cost calculated** based on token usage

### Model Selection Priority

```
1. Database default model (set in admin panel)
2. Environment variable (DEFAULT_AI_MODEL)
3. Fallback: openai/gpt-4o-mini
```

### Admin Access Control

```
User Request → Clerk Auth → Check isAdmin field → Grant/Deny
```

All admin routes use the `requireAdmin()` guard which:
- Checks Clerk authentication
- Verifies `isAdmin = true` in database
- Returns 403 if not authorized

---

## 📊 Available AI Models

### OpenAI
| Model | ID | Cost (Input/Output per 1k) |
|-------|----|-----------------------------|
| GPT-4o Mini | `openai/gpt-4o-mini` | $0.15 / $0.60 |
| GPT-4o | `openai/gpt-4o` | $2.50 / $10.00 |

### Anthropic (Claude)
| Model | ID | Cost (Input/Output per 1k) |
|-------|----|-----------------------------|
| Claude 3.5 Sonnet | `anthropic/claude-3.5-sonnet` | $3.00 / $15.00 |
| Claude 3 Haiku | `anthropic/claude-3-haiku` | $0.25 / $1.25 |

### Google
| Model | ID | Cost (Input/Output per 1k) |
|-------|----|-----------------------------|
| Gemini Pro | `google/gemini-pro` | $0.50 / $1.50 |
| Gemini Flash | `google/gemini-flash` | $0.075 / $0.30 |

### Meta
| Model | ID | Cost (Input/Output per 1k) |
|-------|----|-----------------------------|
| Llama 3.1 70B | `meta-llama/llama-3.1-70b-instruct` | $0.80 / $0.80 |

**Recommendation:** Start with `openai/gpt-4o-mini` for cost efficiency, test `anthropic/claude-3.5-sonnet` for quality.

---

## 🔧 API Endpoints

### Admin Models API

```typescript
// Get all models
GET /api/admin/models

// Create new model
POST /api/admin/models
Body: { modelId, provider, displayName, ... }

// Get specific model
GET /api/admin/models/[id]

// Update model
PUT /api/admin/models/[id]
Body: { displayName, isEnabled, temperature, ... }

// Toggle enabled
PATCH /api/admin/models/[id]

// Delete model
DELETE /api/admin/models/[id]

// Get/Set default model
GET /api/admin/models/default
PUT /api/admin/models/default
Body: { modelId }
```

### Admin Users API

```typescript
// List users
GET /api/admin/users?search=email&role=admin&page=1&limit=50

// Update user (promote/demote)
PUT /api/admin/users
Body: { userId, isAdmin, role, status }
```

### Admin Usage API

```typescript
// Get detailed logs
GET /api/admin/usage?userId=xxx&modelId=xxx&limit=100

// Get aggregate stats
GET /api/admin/usage?aggregate=true&startDate=xxx&endDate=xxx
```

---

## 📝 Scripts Reference

```bash
# Development
npm run dev                    # Start dev server

# Database
npm run seed:models            # Seed AI models
npm run promote:admin <email>  # Promote user to admin

# Build
npm run build                  # Production build
npm run start                  # Start production server
```

---

## 🛡️ Security Considerations

1. **Admin Access**
   - Only users with `isAdmin = true` can access `/admin/*`
   - Middleware protects all routes via Clerk
   - Admin endpoints use `requireAdmin()` guard

2. **API Key Security**
   - Never commit `.env` files
   - Use different keys for dev/production
   - OpenRouter keys have usage limits

3. **Database**
   - User roles stored in database (not JWT)
   - Cannot promote yourself via UI
   - Audit logging for admin actions

---

## 🐛 Troubleshooting

### "No models available"
**Solution:** Run `npm run seed:models`

### "Unauthorized - Please sign in"
**Solution:** Make sure you're signed in with Clerk

### "Forbidden - Admin access required"
**Solution:** Run `npm run promote:admin your-email@example.com`

### "OpenRouter API error"
**Solution:**
- Check `OPENROUTER_API_KEY` is set
- Verify you have credits at https://openrouter.ai/credits
- Check model is available and enabled

### "Model not found" during assessment
**Solution:**
- Go to `/admin/models`
- Set a default model
- Ensure at least one model is enabled

---

## 📈 Cost Optimization Tips

1. **Use GPT-4o Mini** for most assessments (cheaper, fast)
2. **Enable Claude 3 Haiku** for similar quality at lower cost
3. **Monitor costs** in `/admin/analytics`
4. **Set token limits** in model config (default: 3000)
5. **Disable expensive models** you don't need

---

## 🎨 Customization

### Add New Models

1. **Via Admin UI:**
   - Not yet implemented (coming soon)

2. **Via Database:**
   ```sql
   INSERT INTO ai_model_configs (modelId, provider, displayName, isEnabled, ...)
   VALUES ('provider/model-name', 'provider', 'Display Name', true, ...);
   ```

3. **Via Code:**
   - Add to `src/lib/ai-config.ts` → `PREDEFINED_MODELS`
   - Run `npm run seed:models` again

### Modify Default Parameters

Edit `src/lib/ai-config.ts`:
```typescript
export const DEFAULT_GENERATION_PARAMS = {
  temperature: 0.7,  // 0.0 - 1.0
  maxTokens: 3000,   // Max output tokens
};
```

---

## 📚 File Structure

```
src/
├── app/
│   ├── admin/                     # Admin panel pages
│   │   ├── layout.tsx            # Admin layout with nav
│   │   ├── page.tsx              # Dashboard
│   │   ├── models/page.tsx       # AI models management
│   │   ├── users/page.tsx        # User management
│   │   └── analytics/page.tsx    # Usage analytics
│   ├── api/admin/                # Admin API routes
│   │   ├── models/route.ts
│   │   ├── models/[id]/route.ts
│   │   ├── models/default/route.ts
│   │   ├── users/route.ts
│   │   └── usage/route.ts
│   └── actions.tsx               # Updated with OpenRouter
├── entities/
│   ├── UserEntity.ts             # Updated with admin fields
│   ├── AIModelConfigEntity.ts    # NEW
│   └── AIUsageLogEntity.ts       # NEW
├── lib/
│   ├── ai-config.ts              # NEW - OpenRouter config
│   ├── ai-model-service.ts       # NEW - Model CRUD
│   ├── admin-guard.ts            # NEW - Admin auth
│   └── data-source.ts            # Updated with new entities
└── scripts/
    ├── seed-ai-models.ts         # NEW - Seed script
    └── promote-admin.ts          # NEW - Admin promotion
```

---

## 🚢 Production Deployment

1. **Set environment variables** on your hosting platform
2. **Run database migrations** (or enable sync temporarily)
3. **Seed models:** Connect via SSH and run `npm run seed:models`
4. **Promote admin:** Run `npm run promote:admin <your-email>`
5. **Monitor costs** at https://openrouter.ai/usage

---

## 🔄 Migration from OpenAI to OpenRouter

The system now uses **OpenRouter** instead of direct OpenAI API:

### Changes Made:
- ✅ Updated `actions.tsx` to use OpenRouter
- ✅ Created `ai-config.ts` with OpenRouter client
- ✅ Added usage tracking and cost calculation
- ✅ Database stores model configurations
- ✅ Admin panel for model management

### Backward Compatibility:
- Old `OPENAI_API_KEY` is no longer used
- Replace with `OPENROUTER_API_KEY`
- Same `generateText()` API from Vercel AI SDK
- No changes to frontend code needed

---

## 💡 Future Enhancements

Potential features to add:
- [ ] Model testing UI (send test prompts)
- [ ] Cost alerts and budgets
- [ ] A/B testing different models
- [ ] Custom model parameters per user
- [ ] Export analytics to CSV
- [ ] Real-time usage dashboard
- [ ] Model performance comparisons

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs in `/admin/analytics`
3. Verify environment variables
4. Check OpenRouter status: https://openrouter.ai/docs

---

**Last Updated:** October 2025
**Version:** 1.0.0
