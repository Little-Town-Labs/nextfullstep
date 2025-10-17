# AI Career Transition Platform - User Flow

## Platform Vision
**Help people transition into AI economy jobs by:**
1. Starting with their existing skills
2. Getting personalized assessment of AI career readiness
3. Following structured upskilling roadmaps
4. Tracking progress toward landing their AI role

---

## Core User Journey

### Phase 1: Discovery & Assessment (Week 1)

#### Step 1.1: Welcome & Goal Setting
**User Entry Point**
- Landing page: "Find Your Path in the AI Economy"
- Value proposition: "Discover which AI role fits your background and get a personalized roadmap"
- CTA: "Start Your AI Career Assessment"

**Initial Questions:**
1. What's your current role/background?
2. Why are you interested in AI careers?
3. Timeline: When do you want to be job-ready?
4. Commitment level: Hours per week available for learning

**Outcome:** User profile created with baseline information

---

#### Step 1.2: Career Path Exploration
**Present 17 AI Career Options**

Display as interactive cards organized by categories:

**Technical Engineering (5 roles)**
- ML Engineering
- Deep Learning Engineering
- Computer Vision Engineering
- Natural Language Processing
- AI Research Scientist

**Business & Leadership (4 roles)**
- AI Product Management
- AI Strategist
- AI Governance Specialist
- AI Customer Success Manager

**Compliance & Risk (3 roles)**
- AI Ethics & Governance
- AI Compliance Manager
- AI Change Management Specialist

**Emerging & Creative (4 roles)**
- AI Prompt Engineering
- AI Coach
- AI Content Creation
- AI Conversation Designer

**Entry Level (1 role)**
- AI Data Annotator/Trainer

**Each card shows:**
- Role title + growth rate (e.g., "AI Coach +57.7% YoY")
- 2-3 sentence description
- Salary range
- Key skills required
- "Learn More" and "Assess My Fit" buttons

**Outcome:** User selects 1-3 roles they're interested in exploring

---

#### Step 1.3: Structured Career Assessment
**Run Career Advisor Prompt Interview**

**For each selected role:**
1. Show role overview and what to expect
2. Present 8 questions one at a time (from career-pathing-prompts.md)
3. Collect detailed responses
4. Show progress indicator (Question 3 of 8)
5. Allow save & resume later

**Assessment Format:**
```
Question 1 of 8: [Question text]

[Text input area with guidance]
- Placeholder text with examples
- Character counter
- "Need help?" tooltip with what to include

[Back] [Save & Exit] [Next]
```

**Outcome:** Complete assessment data collected for analysis

---

#### Step 1.4: Qualification Verdict & Roadmap
**AI Analysis & Results Presentation**

**Generate using prompt's assessment logic:**

**Qualification Verdict Display:**
```
Your AI [Role Name] Readiness: [Qualified Now / Nearly Qualified / Significant Gaps / Not Viable]

Timeline to Job Ready: [X months]

Match Score: [75-100%] ✅ / [50-74%] ⚡ / [25-49%] 📚 / [0-24%] 🔄

[Visual progress bar]
```

**Detailed Breakdown:**
1. **Strengths:** What you bring to the table
2. **Critical Gaps:** 2-3 specific blockers with severity
3. **Recommended Actions:** Specific next steps
4. **Salary Reality Check:** Based on location and experience
5. **Career Path:** Alternative routes or prerequisites

**Interactive Roadmap:**
- Visual timeline showing phases
- Milestones with target dates
- Resources tagged to each phase
- Estimated time investment per week

**CTA Options:**
- "Start My Roadmap" → Proceed to Phase 2
- "Explore Another Role" → Return to Step 1.2
- "Download My Assessment" → PDF export
- "Schedule Coach Call" → Optional paid service

**Outcome:** User understands their readiness and has personalized roadmap

---

### Phase 2: Skill Development (Weeks 2-26)

#### Step 2.1: Roadmap Activation
**Transform Assessment into Actionable Plan**

**Immediate Actions (Next 30 days)**
- [ ] Action 1 [Estimated: 2 hours] [Resource link]
- [ ] Action 2 [Estimated: 5 hours] [Resource link]
- [ ] Action 3 [Estimated: 3 hours] [Resource link]

**3-6 Month Goals**
- [ ] Goal 1 [Target: Week 12] [Prerequisites: Action 1, 2]
- [ ] Goal 2 [Target: Week 16] [Prerequisites: Goal 1]
- [ ] Goal 3 [Target: Week 20]

**6-12 Month Milestones**
- [ ] Milestone 1 [Target: Month 8]
- [ ] Milestone 2 [Target: Month 11]

**Each item includes:**
- Description and success criteria
- Estimated time investment
- Priority level (Critical / Important / Nice-to-have)
- Resources (courses, articles, projects)
- Checkbox to mark complete
- Notes section for reflection

**Outcome:** Clear action plan with trackable progress

---

#### Step 2.2: Progress Tracking Dashboard

**Main Dashboard View:**

```
┌─────────────────────────────────────────────────────┐
│ Your AI Career Journey: [Role Name]                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Overall Progress: ████████░░░░░░░░░░ 45%           │
│ Target Role Ready: August 2025 (18 weeks)           │
│                                                      │
│ This Week's Focus:                                  │
│ ▶ Complete Python for ML course (Module 3-4)       │
│ ▶ Build portfolio project: Image classifier        │
│                                                      │
│ [Weekly Stats]                                      │
│ • Hours invested: 12 / 15 target                   │
│ • Tasks completed: 3 / 5                           │
│ • Streak: 🔥 14 days                                │
│                                                      │
└─────────────────────────────────────────────────────┘

[Current Phase] [Resources] [Community] [Job Board]
```

**Key Metrics Tracked:**
1. **Completion Rates**
   - Immediate actions (30-day): X/Y complete
   - 3-6 month goals: X/Y complete
   - 6-12 month milestones: X/Y complete

2. **Time Investment**
   - Hours this week
   - Total hours invested
   - Hours vs. target pace

3. **Skill Acquisition**
   - Skills marked as "learning"
   - Skills marked as "proficient"
   - Gap analysis updates

4. **Momentum Indicators**
   - Current streak (consecutive days active)
   - Weekly consistency score
   - Milestone velocity

**Outcome:** User can see progress and stay motivated

---

#### Step 2.3: Learning Resource Integration

**Resource Library Per Career Path:**

**Organized by:**
- Current phase (Immediate / 3-6mo / 6-12mo)
- Resource type (Course / Book / Project / Certification)
- Time investment (< 10hrs / 10-50hrs / 50-100hrs / 100+hrs)
- Cost (Free / $0-50 / $50-200 / $200+)

**For each resource:**
- Title and provider
- Duration and cost
- User rating (from community)
- Relevance to roadmap phase
- Prerequisites
- "Add to My Plan" button
- Progress tracking (0-100%)

**Integration with Roadmap:**
- Resources auto-recommended based on current phase
- Mark as "In Progress" / "Completed"
- Log hours spent
- Add notes and reflections
- Share with community

**Outcome:** Curated, trackable learning resources

---

#### Step 2.4: Portfolio Building

**Project Tracker:**

**For technical roles (ML, CV, NLP, etc.):**
- GitHub integration
- Project templates provided
- Step-by-step guides
- Code review community
- Showcase completed projects

**For non-technical roles (Content, Coach, Strategy):**
- Case study templates
- Work sample formats
- Portfolio site builder
- LinkedIn optimization guide

**Portfolio Requirements Checklist:**
- [ ] 3 completed projects demonstrating key skills
- [ ] Published on GitHub/portfolio site
- [ ] Written case studies explaining approach
- [ ] Results and metrics documented
- [ ] Testimonials or feedback collected

**Outcome:** Job-ready portfolio pieces

---

### Phase 3: Job Search Preparation (Weeks 20-24)

#### Step 3.1: Resume & Profile Optimization

**AI-Powered Tools:**
1. **Resume Builder**
   - Template for specific AI role
   - Keyword optimization
   - Achievement quantification helper
   - ATS compatibility checker

2. **LinkedIn Optimization**
   - Profile headline generator
   - Experience section rewriter (emphasizing AI relevance)
   - Skills endorsement strategy
   - Recommendation request templates

3. **Portfolio Presentation**
   - GitHub profile optimization
   - Portfolio site template
   - Project README templates
   - Case study structure

**Outcome:** Professional presence aligned with target role

---

#### Step 3.2: Interview Preparation

**Role-Specific Prep:**

**For each of the 17 roles:**
- Common interview questions
- Technical assessment practice (for engineering roles)
- Case study frameworks (for strategy/PM roles)
- Scenario-based questions (for governance/compliance)
- Behavioral interview prep

**Mock Interview System:**
- AI-powered mock interviews
- Record and review answers
- Get feedback on responses
- Practice repeatedly

**Interview Tracker:**
- Schedule and track applications
- Record interview questions asked
- Note feedback received
- Track follow-ups

**Outcome:** Confident, well-prepared candidate

---

#### Step 3.3: Job Search Strategy

**Job Board Integration:**

**Curated AI Job Listings:**
- Filtered by user's target role
- Experience level appropriate
- Location/remote preferences
- Salary range match

**Application Tracking:**
```
┌─────────────────────────────────────────────────────┐
│ Application Pipeline                                 │
├─────────────────────────────────────────────────────┤
│ • Wishlist: 12 companies                            │
│ • Applied: 8 positions                              │
│ • In Progress: 3 (screening, interviews)           │
│ • Offers: 1 🎉                                      │
└─────────────────────────────────────────────────────┘
```

**For each application:**
- Company and role details
- Application date
- Current stage
- Next steps and deadlines
- Contact person
- Notes and follow-ups

**Networking Tools:**
- Target company employee finder (LinkedIn)
- Informational interview templates
- Coffee chat request scripts
- Thank you note templates

**Outcome:** Organized, strategic job search

---

### Phase 4: Ongoing Success (Post-Hire)

#### Step 4.1: First 90 Days Plan

**Once user lands role:**
- Transition from "job seeker" to "new professional"
- 30-60-90 day success plan
- Onboarding checklist
- Relationship building guide
- Quick wins identification

#### Step 4.2: Continuous Learning

**Career Growth Path:**
- Next level role assessment
- Emerging skills to develop
- Leadership development
- Specialization opportunities

#### Step 4.3: Community Contribution

**Give Back:**
- Mentor new platform users
- Share job search experience
- Contribute portfolio examples
- Provide company insights

**Outcome:** Long-term platform engagement and success

---

## Key Platform Features

### 1. Dashboard (Home)
**Quick View:**
- Current progress summary
- This week's tasks
- Upcoming deadlines
- Streak and momentum indicators
- Recent activity feed

### 2. Roadmap (Plan)
**Detailed View:**
- Complete roadmap visualization
- Phase-based navigation
- Task management
- Resource library
- Progress analytics

### 3. Portfolio (Showcase)
**Build & Display:**
- Project gallery
- Case studies
- Work samples
- Resume/CV
- Public profile link

### 4. Jobs (Search)
**Application Hub:**
- Job board (curated)
- Application tracker
- Interview prep
- Networking tools
- Salary negotiation resources

### 5. Community (Connect)
**Peer Support:**
- Discussion forums by role
- Study groups
- Accountability partners
- Success stories
- Q&A with experts

### 6. Profile (Settings)
**Manage Account:**
- Assessment history
- Goal updates
- Notification preferences
- Subscription management
- Data export

---

## Data Model Requirements

### User Profile
```javascript
{
  userId: "uuid",
  email: "user@example.com",
  profile: {
    currentRole: "Software Developer",
    experience: "5 years",
    location: "San Francisco, CA",
    availability: "15 hours/week",
    targetTimeline: "6 months",
    goalStatement: "Transition to ML Engineering"
  },
  assessments: [
    {
      assessmentId: "uuid",
      roleId: "ml-engineering",
      completedDate: "2025-01-15",
      responses: [{questionId, answer}],
      verdict: {
        tier: "NEARLY_QUALIFIED",
        score: 65,
        timeline: "4-8 months",
        strengths: [],
        gaps: [],
        recommendations: []
      }
    }
  ],
  activeRoadmap: {
    roleId: "ml-engineering",
    startDate: "2025-01-15",
    targetDate: "2025-08-15",
    currentPhase: "SKILL_DEVELOPMENT",
    milestones: []
  },
  progress: {
    tasksCompleted: 12,
    totalTasks: 45,
    hoursInvested: 78,
    currentStreak: 14,
    lastActive: "2025-01-14"
  }
}
```

### Career Assessment
```javascript
{
  assessmentId: "uuid",
  userId: "uuid",
  roleId: "ml-engineering",
  roleName: "ML Engineering",
  status: "COMPLETED",
  startedAt: "2025-01-15T10:00:00Z",
  completedAt: "2025-01-15T10:45:00Z",
  responses: [
    {
      questionId: 1,
      questionText: "Educational Foundation...",
      answer: "BS Computer Science, Stanford 2018...",
      timestamp: "2025-01-15T10:05:00Z"
    }
  ],
  verdict: {
    tier: "NEARLY_QUALIFIED", // QUALIFIED_NOW, NEARLY_QUALIFIED, SIGNIFICANT_GAPS, NOT_VIABLE
    score: 65,
    timeline: "4-8 months",
    strengths: [
      "Strong programming background",
      "Formal CS education",
      "Experience with Python"
    ],
    gaps: [
      "Limited ML framework experience",
      "No deployed ML models",
      "Mathematics needs refresher"
    ],
    criticalBlockers: [
      "Need hands-on ML project experience",
      "Strengthen linear algebra and statistics"
    ],
    recommendations: [
      {
        type: "COURSE",
        title: "Andrew Ng ML Specialization",
        priority: "CRITICAL",
        estimatedHours: 60
      }
    ],
    salaryRange: {
      location: "San Francisco",
      entryLevel: "$110K-$145K",
      midLevel: "$145K-$200K"
    },
    nextAction: "Complete Week 1 of ML Specialization course"
  }
}
```

### Roadmap
```javascript
{
  roadmapId: "uuid",
  userId: "uuid",
  roleId: "ml-engineering",
  basedOnAssessment: "assessmentId",
  createdAt: "2025-01-15",
  status: "ACTIVE", // ACTIVE, COMPLETED, ABANDONED

  phases: [
    {
      phaseId: "immediate",
      name: "Immediate Actions",
      timeframe: "Next 30 days",
      targetDate: "2025-02-15",
      status: "IN_PROGRESS",
      progress: 40,

      tasks: [
        {
          taskId: "uuid",
          title: "Complete Python for ML course",
          description: "Focus on NumPy, Pandas, Matplotlib",
          priority: "CRITICAL",
          estimatedHours: 20,
          status: "IN_PROGRESS",
          progress: 60,
          dueDate: "2025-02-01",
          resources: [
            {
              type: "COURSE",
              title: "Python for Data Science",
              url: "https://...",
              provider: "DataCamp",
              cost: 0,
              duration: "20 hours"
            }
          ],
          completedAt: null,
          notes: "Working through pandas exercises"
        }
      ]
    }
  ],

  metrics: {
    totalTasks: 45,
    completedTasks: 12,
    inProgressTasks: 3,
    totalEstimatedHours: 320,
    hoursInvested: 78,
    weeklyTarget: 15,
    onTrack: true
  }
}
```

### Portfolio Item
```javascript
{
  portfolioId: "uuid",
  userId: "uuid",
  roleId: "ml-engineering",

  type: "PROJECT", // PROJECT, CASE_STUDY, CERTIFICATION, PUBLICATION

  title: "Image Classification with CNNs",
  description: "Built a CNN to classify chest X-rays for pneumonia detection",

  technologies: ["Python", "TensorFlow", "Keras", "OpenCV"],

  links: {
    github: "https://github.com/user/project",
    demo: "https://project-demo.com",
    article: "https://medium.com/@user/project"
  },

  achievements: [
    "Achieved 94% accuracy on test set",
    "Deployed as web app with 1000+ users",
    "Presented at local ML meetup"
  ],

  timeline: {
    started: "2025-03-01",
    completed: "2025-04-15",
    hoursInvested: 60
  },

  showcaseOrder: 1,
  isPublic: true,
  featured: true
}
```

### Job Application
```javascript
{
  applicationId: "uuid",
  userId: "uuid",

  company: {
    name: "OpenAI",
    website: "https://openai.com",
    size: "1000-5000",
    industry: "AI Research"
  },

  position: {
    title: "ML Engineer",
    level: "Mid-Level",
    location: "San Francisco, CA",
    remote: "Hybrid",
    salary: "$140K-$180K"
  },

  stage: "PHONE_SCREEN", // WISHLIST, APPLIED, PHONE_SCREEN, INTERVIEW, OFFER, REJECTED

  timeline: [
    {
      date: "2025-05-01",
      event: "Applied",
      notes: "Submitted through careers page"
    },
    {
      date: "2025-05-08",
      event: "Phone Screen Scheduled",
      notes: "Call with recruiter, May 15 at 2pm"
    }
  ],

  contacts: [
    {
      name: "Jane Smith",
      role: "Recruiter",
      email: "jane@openai.com",
      linkedIn: "https://..."
    }
  ],

  materials: {
    resumeVersion: "ml-engineer-v3.pdf",
    coverLetter: "openai-cover-letter.pdf",
    portfolioShared: true
  },

  nextSteps: [
    {
      action: "Prepare for technical screen",
      dueDate: "2025-05-14",
      completed: false
    }
  ]
}
```

---

## Technical Integration Points

### 1. Assessment Engine
**Process career advisor prompts:**
- Parse 8 questions from markdown
- Present UI with progress tracking
- Collect and store responses
- Generate qualification verdict using AI (GPT-4/Claude)
- Create personalized roadmap

### 2. Progress Tracking System
**Monitor user advancement:**
- Task completion tracking
- Time investment logging
- Skill gap closure measurement
- Milestone achievement detection
- Weekly/monthly reports

### 3. Resource Recommendation Engine
**Suggest relevant content:**
- Based on current phase
- Matched to skill gaps
- Filtered by user preferences
- Community ratings
- Cost considerations

### 4. Job Board Integration
**Connect to opportunities:**
- Aggregate from multiple sources
- Filter by role match
- Salary range appropriate
- Experience level fitting
- Location/remote preference

### 5. Community Platform
**Enable peer connection:**
- Discussion forums
- Study groups
- Mentor matching
- Success story sharing
- Expert Q&A

---

## Success Metrics

### User Engagement
- Daily/weekly active users
- Assessment completion rate
- Average time on platform
- Task completion velocity
- Streak maintenance

### Career Outcomes
- Time to job offer
- Salary achieved vs. predicted
- Role match accuracy
- User satisfaction scores
- Referral rate

### Platform Health
- User retention (30/60/90 day)
- Paid conversion rate
- Community activity level
- Resource completion rates
- Portfolio quality scores

---

## Monetization Strategy

### Free Tier
- 1 complete career assessment
- Basic roadmap access
- Limited resource library
- Community access
- Basic progress tracking

### Pro Tier ($29/month)
- Unlimited assessments (explore multiple roles)
- Full roadmap with all resources
- Advanced progress analytics
- Priority community access
- Resume/profile optimization tools
- Interview prep materials
- Job application tracking

### Premium Tier ($99/month)
- Everything in Pro
- 1-on-1 coaching sessions (monthly)
- Portfolio review and feedback
- Mock interviews
- Salary negotiation support
- Direct job placement assistance
- Lifetime access to materials

### Enterprise/Bootcamp Tier
- White-label platform for organizations
- Cohort-based learning
- Custom assessment creation
- Advanced analytics dashboard
- Career services integration

---

## Next Steps for Implementation

1. **MVP Scope** (Phase 1 - 8 weeks)
   - User authentication
   - Select 3 most popular roles to start
   - Assessment flow for those 3 roles
   - Basic roadmap display
   - Simple progress tracking
   - Resource links (external)

2. **Beta Launch** (Phase 2 - 12 weeks)
   - Add remaining 14 roles
   - Enhanced progress dashboard
   - Portfolio builder (basic)
   - Community forums (basic)
   - Job board integration

3. **Full Platform** (Phase 3 - 16 weeks)
   - Advanced analytics
   - AI-powered recommendations
   - Mock interview system
   - Mentor matching
   - Mobile app

---

## Questions for Refinement

1. **Target Audience Priority:** Which user segments to focus on first?
   - Career changers from traditional tech?
   - New graduates?
   - Non-tech professionals moving to AI?

2. **Assessment Delivery:** How should we handle the AI analysis?
   - Use GPT-4/Claude API for verdict generation?
   - Pre-programmed scoring logic?
   - Hybrid approach?

3. **Community Features:** How deep should social features go?
   - Basic forums only?
   - Full social networking?
   - Study groups and cohorts?

4. **Resource Strategy:** How to handle learning resources?
   - Curate external links only?
   - Partner with course providers?
   - Create proprietary content?

5. **Coaching Integration:** How to scale human touch?
   - AI-only guidance?
   - Optional paid coaching?
   - Mandatory coach matching?
