# Phase 1: Todo System - Database Schema & Entities

## ✅ Completed Components

### 1. Entity Definitions

#### UserTodoEntity ([src/entities/UserTodoEntity.ts](../src/entities/UserTodoEntity.ts))
Personal todos for users with the following features:
- **Identification**: UUID primary key, user ID indexing
- **Content**: Title, description, notes
- **Categorization**: AI suggested, personal upskilling, general
- **Priority Levels**: Critical, high, normal, low
- **Status Tracking**: Pending, in progress, completed, archived
- **Roadmap Integration**: Links to roadmaps and roadmap tasks
- **Source Tracking**: User created, AI extracted, roadmap derived
- **Time Management**: Estimated minutes, due dates, completion tracking
- **Tags**: JSON array for flexible organization
- **Indexes**: On userId, status, dueDate, linkedToRoadmapId, linkedToTaskId

#### TodoReminderEntity ([src/entities/TodoReminderEntity.ts](../src/entities/TodoReminderEntity.ts))
Reminder system for todos (future enhancement):
- **Configuration**: Frequency (once, daily, weekly), method (email, push, in-app)
- **Scheduling**: Reminder time with index for efficient queries
- **Status Tracking**: Pending, sent, failed, canceled
- **Delivery**: Attempt count, error tracking
- **Customization**: Custom reminder messages
- **Indexes**: On todoId, userId, reminderTime

### 2. Database Configuration

#### Updated data-source.ts ([src/lib/data-source.ts](../src/lib/data-source.ts))
- Registered `UserTodoEntity`
- Registered `TodoReminderEntity`
- Maintains existing entity compatibility

### 3. Migration Scripts

#### TypeORM Migration ([src/migrations/1700000000000-CreateUserTodoTables.ts](../src/migrations/1700000000000-CreateUserTodoTables.ts))
Production-ready migration with:
- Complete table definitions
- All indexes for performance
- Reversible up/down methods
- PostgreSQL compatibility

#### Migration Documentation ([src/migrations/README.md](../src/migrations/README.md))
Comprehensive guide including:
- Schema overview with field descriptions
- Index documentation
- Migration best practices
- Development vs production workflows

### 4. Testing Infrastructure

#### Test Script ([src/scripts/test-todo-entities.ts](../src/scripts/test-todo-entities.ts))
Validates:
- Database connection
- Table creation (synchronize mode)
- Todo CRUD operations
- Reminder CRUD operations
- Query filtering by status and user
- Status updates with completion tracking
- Roadmap linking functionality
- Data cleanup

Run with: `npm run test:entities`

## 📊 Database Schema

### user_todos Table
```sql
CREATE TABLE user_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL,                  -- Indexed
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'personal_upskilling',
  priority VARCHAR(50) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'pending',  -- Indexed
  linkedToRoadmapId UUID,                -- Indexed (nullable FK reference)
  linkedToTaskId UUID,                   -- Indexed (nullable FK reference)
  source VARCHAR(50) DEFAULT 'user_created',
  notes TEXT,
  estimatedMinutes INTEGER,
  tags TEXT,                             -- JSON array
  dueDate TIMESTAMP,                     -- Indexed
  completedAt TIMESTAMP,
  archivedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### todo_reminders Table
```sql
CREATE TABLE todo_reminders (
  id UUID PRIMARY KEY,
  todoId UUID NOT NULL,                  -- Indexed, FK to user_todos(id)
  userId UUID NOT NULL,                  -- Indexed
  reminderTime TIMESTAMP NOT NULL,       -- Indexed
  frequency VARCHAR(50) DEFAULT 'once',
  method VARCHAR(50) DEFAULT 'email',
  status VARCHAR(50) DEFAULT 'pending',
  customMessage VARCHAR(255),
  sentAt TIMESTAMP,
  attemptCount INTEGER DEFAULT 0,
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),

  -- Foreign Key Constraint with CASCADE behavior
  CONSTRAINT FK_TODO_REMINDERS_TODO_ID
    FOREIGN KEY (todoId)
    REFERENCES user_todos(id)
    ON DELETE CASCADE
);
```

**Referential Integrity:**
- The `todoId` column references `user_todos(id)` via foreign key constraint
- **ON DELETE CASCADE**: When a todo is deleted, all associated reminders are automatically deleted
- This prevents orphaned reminders and maintains data consistency

## 🔗 Integration Points

### With Existing Entities

1. **RoadmapEntity**:
   - `linkedToRoadmapId` field in UserTodoEntity
   - Allows todos to be associated with career roadmaps

2. **RoadmapTaskEntity**:
   - `linkedToTaskId` field in UserTodoEntity
   - Enables conversion of roadmap tasks to personal todos

3. **UserEntity**:
   - `userId` field uses Clerk user ID
   - Maintains authentication consistency

## 🎯 Key Features Enabled

### Todo Categories
- **ai_suggested**: Todos suggested by AI during conversations
- **personal_upskilling**: User-created learning and skill development
- **general**: Other personal todos

### Priority System
- **critical**: Urgent, must-do items
- **high**: Important, high-value tasks
- **normal**: Regular tasks
- **low**: Nice-to-have, low-priority items

### Status Workflow
```
pending → in_progress → completed
    ↓
  archived
```

### Source Tracking
- **user_created**: Manually created by user
- **ai_chat_extraction**: Extracted from AI conversations
- **roadmap_derived**: Converted from roadmap tasks

## 🚀 Next Steps (Phase 2)

With the database schema in place, Phase 2 will implement:

1. **API Routes**:
   - `GET /api/todos` - List and filter todos
   - `POST /api/todos` - Create new todo
   - `PUT /api/todos/[id]` - Update todo
   - `DELETE /api/todos/[id]` - Delete/archive
   - `GET /api/todos/stats` - Statistics

2. **Integration APIs**:
   - `POST /api/todos/from-chat` - AI extraction
   - `POST /api/todos/from-roadmap` - Roadmap conversion
   - `GET /api/todos/roadmap-related` - Related queries

## 📝 Usage Examples (Future)

### Creating a Todo
```typescript
const todo = todoRepo.create({
  userId: clerkUserId,
  title: "Complete React Hooks Tutorial",
  description: "Learn useState, useEffect, and custom hooks",
  category: "personal_upskilling",
  priority: "high",
  status: "pending",
  source: "user_created",
  estimatedMinutes: 180,
  tags: JSON.stringify(["react", "hooks", "tutorial"]),
  dueDate: new Date("2024-12-31"),
});

await todoRepo.save(todo);
```

const linkedTodo = todoRepo.create({
  userId: clerkUserId,
  title: "Build Portfolio Website",
  category: "personal_upskilling",
  priority: "high",
  status: "pending",
  source: "roadmap_derived",
  linkedToRoadmapId: roadmapId,
  linkedToTaskId: taskId,
});
### Querying Todos
```typescript
// Get all pending todos for user
const pendingTodos = await todoRepo.find({
  where: {
    userId: clerkUserId,
    status: "pending"
  },
  order: { dueDate: "ASC" },
});

// Get todos due this week
const thisWeek = new Date();
thisWeek.setDate(thisWeek.getDate() + 7);

const upcomingTodos = await todoRepo
  .createQueryBuilder("todo")
  .where("todo.userId = :userId", { userId: clerkUserId })
  .andWhere("todo.dueDate <= :dueDate", { dueDate: thisWeek })
  .andWhere("todo.status != :status", { status: "completed" })
  .orderBy("todo.dueDate", "ASC")
  .getMany();
```

## ✅ Validation

All Phase 1 components have been:
- Created with TypeScript type safety
- Indexed for query performance
- Documented for future development
- Prepared for testing with validation script

Run validation: `npm run test:entities` (requires database connection)

## 🔐 Security Considerations

1. **User Isolation**: All queries must filter by `userId` (Clerk ID)
2. **Authorization**: Verify user owns todos before updates/deletes
3. **Input Validation**: Validate all user inputs before database operations
4. **SQL Injection**: TypeORM parameterization prevents SQL injection
5. **Rate Limiting**: Implement on API routes in Phase 2
6. **Cascade Deletion**:
   - **Rationale**: When a todo is deleted, associated reminders are automatically deleted via `ON DELETE CASCADE`
   - **Behavior**: Deleting a parent todo triggers automatic cleanup of all child reminders
   - **Data Integrity**: Prevents orphaned reminders that reference non-existent todos
   - **Performance**: Database-level cascade is more efficient than application-level cleanup
   - **Transaction Safety**: Cascade operations are atomic within the delete transaction

## 📈 Performance Optimizations

1. **Indexes**: Strategic indexes on frequently queried fields
2. **Pagination**: Implement for large todo lists (Phase 2)
3. **Caching**: Consider Redis caching for active todos (Phase 3+)
4. **Query Optimization**: Use select() to limit returned fields when appropriate

---

**Phase 1 Status**: ✅ **COMPLETE**

Ready to proceed to Phase 2: API Routes Development
