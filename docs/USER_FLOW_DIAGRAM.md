# NextFullStep - User Flow Diagram

## Main User Flow (Mermaid Diagram)

```mermaid
flowchart TD
    Start([User Visits Site]) --> Landing["/  Landing Page"]
    Landing -->|Auto-redirect| Careers["/careers<br/>Careers Page<br/>(ACTUAL LANDING)"]

    Careers -->|User browses roles| AuthCheck{Authenticated?}

    AuthCheck -->|No| SignIn["/sign-in<br/>Sign In / Sign Up"]
    AuthCheck -->|Yes| OnboardCheck{Onboarding<br/>Complete?}

    SignIn --> OnboardCheck

    OnboardCheck -->|No| Onboarding["/onboarding<br/>3-Step Setup"]
    OnboardCheck -->|Yes| Dashboard["/dashboard<br/>User Dashboard"]

    Onboarding -->|Complete Setup| Dashboard
    Onboarding -->|Skip| Dashboard

    Dashboard --> DashActions{User Action}
    DashActions -->|Take Assessment| Careers
    DashActions -->|View Roadmap| ViewRoadmap["/roadmap/{id}<br/>View Existing Roadmap"]
    DashActions -->|Manage Todos| Todos["/dashboard/todos<br/>Todo Management"]

    Careers -->|Select Role| StartAssessment["/assessment/start/{roleId}<br/>Take Assessment<br/>8 Questions"]

    StartAssessment --> AnswerQ[Answer Questions<br/>With Auto-save]
    AnswerQ -->|More Questions| AnswerQ
    AnswerQ -->|Complete| AIAnalysis[AI Analysis<br/>10-30 seconds]

    AIAnalysis --> Results["/assessment/{id}/results<br/>View Results & Verdict"]

    Results --> ResultActions{User Action}
    ResultActions -->|View Roadmap| Roadmap["/roadmap/{id}<br/>Personalized Roadmap"]
    ResultActions -->|Other Roles| Careers
    ResultActions -->|Dashboard| Dashboard

    Roadmap --> TaskActions{Task Action}
    TaskActions -->|Complete Task| UpdateProgress[Update Progress<br/>& Streaks]
    TaskActions -->|Add Notes| AddNotes[Save Task Notes]
    TaskActions -->|Convert to Todo| CreateTodo[Create Personal Todo]

    UpdateProgress --> Roadmap
    AddNotes --> Roadmap
    CreateTodo --> Todos

    Todos --> TodoActions{Todo Action}
    TodoActions -->|View/Edit| TodoDetail["/dashboard/todos/{id}<br/>Todo Details"]
    TodoActions -->|Create New| NewTodo["/dashboard/todos/new<br/>New Todo"]

    TodoDetail --> Todos
    NewTodo --> Todos

    Roadmap -->|Return| Dashboard
    Todos -->|Return| Dashboard

    style Careers fill:#e3f2fd
    style Dashboard fill:#f3e5f5
    style Onboarding fill:#fff3e0
    style StartAssessment fill:#e8f5e9
    style AIAnalysis fill:#ffe0b2
    style Results fill:#f1f8e9
    style Roadmap fill:#e0f2f1
    style Todos fill:#fce4ec
```

## Onboarding Flow Details

```mermaid
flowchart LR
    Start([New User]) --> Step1[Step 1:<br/>Career Goal<br/>- AI Prompt Engineer<br/>- AI Content Creator<br/>- AI Coach<br/>- Just Exploring]

    Step1 --> Step2[Step 2:<br/>Experience Level<br/>- Complete Beginner<br/>- Some Experience<br/>- Intermediate<br/>- Advanced]

    Step2 --> Step3[Step 3:<br/>Time Commitment<br/>- 1-5 hrs/week<br/>- 5-15 hrs/week<br/>- 15-30 hrs/week<br/>- 30+ hrs/week]

    Step3 --> Complete{Action}
    Complete -->|Complete Setup| SaveDB[(Save to Database)]
    Complete -->|Skip| Dashboard["/dashboard"]

    SaveDB --> Dashboard

    style Step1 fill:#e3f2fd
    style Step2 fill:#e8f5e9
    style Step3 fill:#fff3e0
    style SaveDB fill:#ffccbc
```

## Assessment Flow Details

```mermaid
flowchart TD
    Start([Select Career Role]) --> CreateAssessment[Create/Resume Assessment]

    CreateAssessment --> Q1[Question 1:<br/>Background & Skills]
    Q1 -->|Save| Q2[Question 2:<br/>Experience]
    Q2 -->|Save| Q3[Question 3:<br/>Learning Ability]
    Q3 -->|Save| Q4[Question 4:<br/>Time Availability]
    Q4 -->|Save| Q5[Question 5:<br/>Resources]
    Q5 -->|Save| Q6[Question 6:<br/>Commitment]
    Q6 -->|Save| Q7[Question 7:<br/>Obstacles]
    Q7 -->|Save| Q8[Question 8:<br/>Goals]

    Q8 -->|Complete| Trigger[Trigger AI Analysis]

    Trigger --> AI[AI Processing:<br/>- Analyze responses<br/>- Calculate score<br/>- Determine tier<br/>- Generate roadmap]

    AI --> Verdict{Verdict Tier}

    Verdict -->|Score 80-100%| Qualified[✅ QUALIFIED NOW<br/>Ready to start]
    Verdict -->|Score 60-79%| Nearly[⚡ NEARLY QUALIFIED<br/>Few gaps to fill]
    Verdict -->|Score 40-59%| Gaps[📚 SIGNIFICANT GAPS<br/>Learning needed]
    Verdict -->|Score 0-39%| NotViable[🔄 NOT VIABLE<br/>Major pivot needed]

    Qualified --> Results[Show Results Page]
    Nearly --> Results
    Gaps --> Results
    NotViable --> Results

    Results --> GenerateRoadmap[Auto-Generate<br/>Personalized Roadmap]

    GenerateRoadmap --> Done([View Roadmap])

    style AI fill:#ffe0b2
    style Qualified fill:#c8e6c9
    style Nearly fill:#fff9c4
    style Gaps fill:#ffccbc
    style NotViable fill:#ffcdd2
```

## Roadmap Structure

```mermaid
flowchart TB
    Roadmap[Roadmap for Role] --> Phase1[Phase 1: IMMEDIATE<br/>Next 30 Days]
    Roadmap --> Phase2[Phase 2: SHORT TERM<br/>1-3 Months]
    Roadmap --> Phase3[Phase 3: MID TERM<br/>3-6 Months]

    Phase1 --> P1T1[Task: CRITICAL Priority<br/>Est: 8 hours]
    Phase1 --> P1T2[Task: HIGH Priority<br/>Est: 4 hours]
    Phase1 --> P1T3[Task: NORMAL Priority<br/>Est: 6 hours]

    Phase2 --> P2T1[Task: HIGH Priority<br/>Est: 20 hours]
    Phase2 --> P2T2[Task: NORMAL Priority<br/>Est: 5 hours]

    Phase3 --> P3T1[Task: HIGH Priority<br/>Est: 40 hours]

    P1T1 --> Actions1{Task Actions}
    Actions1 -->|Check Complete| UpdateDB1[(Update Progress)]
    Actions1 -->|Expand Details| ShowDetails1[Show:<br/>- Description<br/>- Resources<br/>- Notes<br/>- Convert to Todo]
    Actions1 -->|Convert| CreateTodo1[Create Personal Todo]

    UpdateDB1 --> Stats[Update:<br/>- Progress %<br/>- Streak Counter<br/>- Days Active]

    style Phase1 fill:#e1bee7
    style Phase2 fill:#bbdefb
    style Phase3 fill:#c8e6c9
    style Stats fill:#fff9c4
```

## Authentication & Authorization Flow

```mermaid
flowchart TD
    Request([User Request]) --> Middleware{Middleware Check}

    Middleware -->|Public Route| Allow[Allow Access]
    Middleware -->|Protected Route| AuthCheck{Authenticated?}

    AuthCheck -->|No| RedirectSignIn[Redirect to /sign-in]
    AuthCheck -->|Yes| OnboardCheck{Onboarding<br/>Complete?}

    OnboardCheck -->|No| RedirectOnboard[Redirect to /onboarding]
    OnboardCheck -->|Yes| Allow

    Allow --> RenderPage[Render Requested Page]

    RedirectSignIn --> ClerkAuth[Clerk Authentication]
    ClerkAuth --> WebhookSync[Webhook Syncs User to DB]
    WebhookSync --> OnboardCheck

    RedirectOnboard --> SavePrefs[Save User Preferences]
    SavePrefs --> RenderPage

    style AuthCheck fill:#ffccbc
    style OnboardCheck fill:#fff9c4
    style ClerkAuth fill:#e1bee7
    style Allow fill:#c8e6c9
```

---

## Key User Journeys

### Journey 1: New User → First Roadmap
```mermaid
journey
    title New User Complete Journey
    section Discovery
      Visit Landing Page: 5: User
      View Careers Page: 5: User
      Browse AI Career Roles: 4: User
    section Authentication
      Click Career Role: 5: User
      Sign In/Up: 3: User, System
      Complete Onboarding: 4: User
    section Assessment
      View Dashboard: 5: User
      Take New Assessment: 5: User
      Answer 8 Questions: 3: User
      Wait for AI Analysis: 2: System
    section Results
      View Verdict & Score: 4: User, System
      Read Analysis: 4: User
      View Roadmap: 5: User
    section Progress
      Start Tasks: 5: User
      Track Progress: 5: User, System
```

### Journey 2: Returning User → Continue Progress
```mermaid
journey
    title Returning User Journey
    section Return
      Visit Site: 5: User
      Auto Login: 5: System
      View Dashboard: 5: User
    section Progress
      Continue Roadmap: 5: User
      Complete Tasks: 4: User
      Update Streaks: 5: System
      Convert to Todos: 4: User
    section Management
      Manage Personal Todos: 4: User
      Track Overall Progress: 5: User, System
```

### Journey 3: Multi-Role Exploration
```mermaid
journey
    title Multi-Role User Journey
    section First Role
      Complete Assessment 1: 4: User
      Work on Roadmap 1: 5: User
    section Second Role
      Take New Assessment: 5: User
      Get Second Roadmap: 5: System
    section Management
      View Multiple Roadmaps: 5: User
      Switch Between Roles: 5: User
      Track All Progress: 5: User, System
```

---

## Route Structure

### Public Routes (No Auth Required)
- `/` - Landing (redirects to /careers)
- `/careers` - Career roles listing
- `/pricing` - Subscription plans
- `/sign-in` - Authentication
- `/sign-up` - Registration

### Protected Routes (Auth Required)
- `/dashboard` - User dashboard
- `/dashboard/settings` - Account settings
- `/dashboard/todos` - Todo management
- `/dashboard/todos/new` - Create todo
- `/dashboard/todos/{id}` - Todo details
- `/onboarding` - First-time setup
- `/assessment/start/{roleId}` - Take assessment
- `/assessment/{id}/results` - View results
- `/roadmap/{id}` - View roadmap

---

## API Endpoints

### Career & Assessment APIs
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant AI
    participant DB

    User->>Frontend: Select Career Role
    Frontend->>API: GET /api/careers?id={roleId}
    API->>DB: Fetch role details
    DB-->>API: Role data
    API-->>Frontend: Role information

    User->>Frontend: Start Assessment
    Frontend->>API: POST /api/assessment
    API->>DB: Create/Resume assessment
    DB-->>API: Assessment ID
    API-->>Frontend: Assessment created

    User->>Frontend: Answer Questions
    Frontend->>API: PUT /api/assessment/{id}
    API->>DB: Save responses
    DB-->>API: Saved
    API-->>Frontend: Progress updated

    User->>Frontend: Complete Assessment
    Frontend->>API: POST /api/assessment/{id}/complete
    API->>AI: Analyze responses
    AI-->>API: Verdict + Roadmap
    API->>DB: Save results
    DB-->>API: Saved
    API-->>Frontend: Results ready

    Frontend-->>User: Show verdict & roadmap
```

### Roadmap & Progress APIs
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB

    User->>Frontend: View Roadmap
    Frontend->>API: GET /api/roadmap?id={roadmapId}
    API->>DB: Fetch roadmap + tasks
    DB-->>API: Roadmap data
    API-->>Frontend: Roadmap with phases
    Frontend-->>User: Display roadmap

    User->>Frontend: Complete Task
    Frontend->>API: PUT /api/roadmap/task/{taskId}
    API->>DB: Update task status
    DB->>DB: Recalculate progress & streaks
    DB-->>API: Updated roadmap
    API-->>Frontend: New progress
    Frontend-->>User: Updated UI

    User->>Frontend: Convert to Todo
    Frontend->>API: POST /api/todos/from-roadmap
    API->>DB: Create todo from task
    DB-->>API: Todo created
    API-->>Frontend: Success
    Frontend-->>User: Todo available
```

---

## Database Schema Overview

```mermaid
erDiagram
    User ||--o{ CareerAssessment : takes
    User ||--o{ Roadmap : owns
    User ||--o{ Todo : creates
    Todo ||--o{ Reminder : has

    CareerAssessment ||--|| Roadmap : generates
    Roadmap ||--o{ RoadmapTask : contains
    RoadmapTask ||--o| Todo : converts_to

    User {
        string clerkUserId PK
        string email
        string subscriptionTier
        int assessmentsLimit
        int roadmapsLimit
        boolean onboardingCompleted
        string selectedGoal
        string experienceLevel
        string timeCommitment
    }

    CareerAssessment {
        string id PK
        string userId FK
        string roleId
        string roleName
        json responses
        string status
        string verdictTier
        int verdictScore
        string verdictTimeline
        text fullAnalysis
    }

    Roadmap {
        string id PK
        string userId FK
        string assessmentId FK
        string roleId
        string roleName
        int totalTasks
        int completedTasks
        int progressPercentage
        int currentStreak
        int longestStreak
        json phases
    }

    Todo {
        string id PK
        string userId FK
        string title
        text description
        string priority
        string status
        date dueDate
        string roadmapTaskId FK
    }

    Reminder {
        string id PK
        string todoId FK
        datetime reminderTime
        string type
        boolean sent
    }
```

---

## Progress Tracking System

```mermaid
flowchart LR
    TaskComplete[User Completes Task] --> Update1[Update Task Status]
    Update1 --> Calc1[Calculate Completed Tasks]
    Calc1 --> Calc2[Calculate Progress %]
    Calc2 --> CheckDate{Activity Today?}

    CheckDate -->|Yes| MaintainStreak[Maintain Current Streak]
    CheckDate -->|No| CheckYesterday{Activity Yesterday?}

    CheckYesterday -->|Yes| IncrementStreak[Increment Streak Counter]
    CheckYesterday -->|No| ResetStreak[Reset Streak to 1]

    IncrementStreak --> CheckLongest{Longest Streak?}
    MaintainStreak --> CheckLongest
    ResetStreak --> CheckLongest

    CheckLongest -->|New Record| UpdateLongest[Update Longest Streak]
    CheckLongest -->|Not New| Skip[Skip]

    UpdateLongest --> SaveDB[(Save All Metrics)]
    Skip --> SaveDB

    SaveDB --> UpdateUI[Update Dashboard UI]

    style TaskComplete fill:#e3f2fd
    style SaveDB fill:#ffccbc
    style UpdateUI fill:#c8e6c9
```

---

## Subscription Tier Limits

```mermaid
flowchart TD
    Action[User Takes Action] --> CheckTier{Subscription<br/>Tier?}

    CheckTier -->|Free| CheckLimits{Within Limits?}
    CheckTier -->|Pro| Allow[Allow Unlimited]
    CheckTier -->|Enterprise| Allow

    CheckLimits -->|Assessments: < 3| AllowFree[Allow Action]
    CheckLimits -->|Roadmaps: < 1| AllowFree
    CheckLimits -->|Exceeded| Block[Block & Show Upgrade]

    Block --> Pricing[Show /pricing Page]
    AllowFree --> Complete[Complete Action]
    Allow --> Complete

    Pricing --> Upgrade{User Upgrades?}
    Upgrade -->|Yes| ProcessPayment[Process Payment]
    Upgrade -->|No| ReturnDash[Return to Dashboard]

    ProcessPayment --> UpdateTier[(Update User Tier)]
    UpdateTier --> Complete

    style Block fill:#ffcdd2
    style Allow fill:#c8e6c9
    style Pricing fill:#fff9c4
```

---

## Summary

This comprehensive Mermaid diagram set visualizes:

1. **Main User Flow** - Complete journey from landing to roadmap tracking
2. **Onboarding Flow** - 3-step setup process
3. **Assessment Flow** - Question answering and AI analysis
4. **Roadmap Structure** - Phase-based task organization
5. **Authentication Flow** - Security and access control
6. **User Journeys** - Different user scenarios
7. **API Sequences** - Backend communication patterns
8. **Database Schema** - Data relationships
9. **Progress Tracking** - Streak and completion calculations
10. **Subscription Limits** - Tier-based access control

Each diagram can be rendered in any Mermaid-compatible viewer (GitHub, GitLab, VS Code with Mermaid extension, etc.).
