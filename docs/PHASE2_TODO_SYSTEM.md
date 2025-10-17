# Phase 2: Todo System - API Routes Development

## ✅ Completed Components

### 1. Validation Schemas

#### [src/lib/validations/todo.ts](../src/lib/validations/todo.ts)
Comprehensive Zod validation schemas for all todo operations:
- **Category Enum**: `ai_suggested`, `personal_upskilling`, `general`
- **Priority Enum**: `critical`, `high`, `normal`, `low`
- **Status Enum**: `pending`, `in_progress`, `completed`, `archived`
- **Source Enum**: `user_created`, `ai_chat_extraction`, `roadmap_derived`
- **Create Todo Schema**: Validates all fields for new todos
- **Update Todo Schema**: Partial validation for updates
- **Query Schema**: Validates filtering, sorting, and pagination
- **From Roadmap Schema**: Validates roadmap task conversion

### 2. Helper Functions

#### [src/lib/todo-helpers.ts](../src/lib/todo-helpers.ts)
Utility functions for common todo operations:
- `buildTodoWhereClause()` - Build TypeORM where conditions
- `queryTodosWithFilters()` - Complex queries with filters
- `calculateTodoStats()` - Comprehensive statistics calculation
- `formatTodoResponse()` - Consistent API response formatting
- `getPriorityRank()` - Priority sorting utility

### 3. API Routes

#### Core CRUD Endpoints

##### **GET /api/todos** - [src/app/api/todos/route.ts](../src/app/api/todos/route.ts)
List todos with advanced filtering, searching, sorting, and pagination:
- **Filters**: status, category, priority, roadmap links, date ranges
- **Search**: Full-text search in title and description
- **Sorting**: By createdAt, updatedAt, dueDate, priority, or title
- **Pagination**: Limit (max 100) and offset support
- **Response**: Returns todos array with pagination metadata

##### **POST /api/todos** - [src/app/api/todos/route.ts](../src/app/api/todos/route.ts)
Create new todo:
- Validates all input fields with Zod
- Sets default values (category, priority, status)
- Returns created todo with 201 status

##### **GET /api/todos/[id]** - [src/app/api/todos/[id]/route.ts](../src/app/api/todos/[id]/route.ts)
Get specific todo:
- Validates user owns the todo
- Returns single todo details

##### **PUT /api/todos/[id]** - [src/app/api/todos/[id]/route.ts](../src/app/api/todos/[id]/route.ts)
Update todo:
- Partial updates (all fields optional)
- Automatically sets timestamps:
  - `completedAt` when status changes to completed
  - `archivedAt` when status changes to archived
- Validates user ownership

##### **DELETE /api/todos/[id]** - [src/app/api/todos/[id]/route.ts](../src/app/api/todos/[id]/route.ts)
Delete or archive todo:
- **Soft Delete** (default): Archives todo, keeps in database
- **Hard Delete**: Permanent removal with `?permanent=true`
- Validates user ownership

#### Statistics Endpoint

##### **GET /api/todos/stats** - [src/app/api/todos/stats/route.ts](../src/app/api/todos/stats/route.ts)
Comprehensive statistics:
- Total, pending, in progress, completed, archived counts
- Breakdown by category
- Breakdown by priority
- Overdue count
- Due this week count
- Roadmap-linked count
- Completion rate percentage

#### Integration Endpoints

##### **POST /api/todos/from-roadmap** - [src/app/api/todos/from-roadmap/route.ts](../src/app/api/todos/from-roadmap/route.ts)
Convert roadmap task to personal todo:
- Validates roadmap ownership
- Checks for existing todo (prevents duplicates)
- Maps task fields to todo fields
- Allows custom title, description, priority
- Links todo to original roadmap and task
- Returns both todo and task information

##### **GET /api/todos/from-roadmap?roadmapId=X** - [src/app/api/todos/from-roadmap/route.ts](../src/app/api/todos/from-roadmap/route.ts)
Get all todos linked to a roadmap:
- Validates roadmap ownership
- Returns todos with roadmap metadata
- Sorted by creation date (newest first)

---

## 🔐 Security Features

### Authentication
- All endpoints require Clerk authentication
- Returns 401 if not authenticated

### Authorization
- Todos are scoped to user ID
- Verification that user owns resources before modifications
- Cannot access other users' todos

### Input Validation
- Zod schemas validate all inputs
- Type-safe validation with detailed error messages
- Prevents SQL injection through TypeORM parameterization
- Maximum lengths enforced (titles, descriptions, notes)

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* todo or array of todos */ },
  "message": "Operation successful",  // Optional
  "pagination": {  // For list endpoints
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed description",
  "details": []  // Validation errors (if applicable)
}
```

---

## 🎯 Key Features Implemented

### 1. Advanced Filtering
```bash
GET /api/todos?status=pending&priority=high&category=personal_upskilling
```

### 2. Date Range Queries
```bash
GET /api/todos?dueAfter=2024-01-01T00:00:00Z&dueBefore=2024-12-31T23:59:59Z
```

### 3. Full-Text Search
```bash
GET /api/todos?search=typescript
```

### 4. Flexible Sorting
```bash
GET /api/todos?sortBy=dueDate&sortOrder=ASC
```

### 5. Pagination
```bash
GET /api/todos?limit=20&offset=40
```

### 6. Roadmap Integration
```bash
POST /api/todos/from-roadmap
{
  "roadmapTaskId": "uuid",
  "customTitle": "My version of this task"
}
```

### 7. Statistics
```bash
GET /api/todos/stats
```

### 8. Soft Delete
```bash
DELETE /api/todos/[id]  # Archives
DELETE /api/todos/[id]?permanent=true  # Deletes permanently
```

---

## 🚀 Performance Optimizations

1. **Database Indexes**: All query fields are indexed
2. **Pagination**: Prevents loading all todos at once
3. **Efficient Queries**: Uses TypeORM query builder for complex filters
4. **Type Safety**: TypeScript prevents runtime errors
5. **Validation Caching**: Zod schemas compiled once

---

## 📝 Example Use Cases

### 1. Get Overdue High-Priority Todos
```bash
GET /api/todos?priority=high&dueBefore=2024-01-15T00:00:00Z&status=pending
```

### 2. Create Learning Todo
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Complete React Advanced Patterns Course",
  "description": "Learn HOCs, render props, and compound components",
  "category": "personal_upskilling",
  "priority": "high",
  "estimatedMinutes": 360,
  "tags": ["react", "javascript", "advanced"],
  "dueDate": "2024-12-31T23:59:59Z"
}
```

### 3. Mark Todo as Completed
```bash
PUT /api/todos/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "status": "completed",
  "notes": "Excellent course! Learned a lot about composition patterns."
}
```

### 4. Convert Roadmap Task to Todo
```bash
POST /api/todos/from-roadmap
Content-Type: application/json

{
  "roadmapTaskId": "roadmap-task-uuid",
  "customTitle": "Build my own version of this project",
  "priority": "critical",
  "dueDate": "2024-02-01T00:00:00Z"
}
```

### 5. Get Dashboard Statistics
```bash
GET /api/todos/stats

# Returns:
{
  "success": true,
  "data": {
    "total": 42,
    "pending": 15,
    "inProgress": 8,
    "completed": 17,
    "archived": 2,
    "overdue": 3,
    "dueThisWeek": 7,
    "completionRate": 40
  }
}
```

---

## 🧪 Testing Recommendations

### Manual Testing
1. **Authentication**: Test without Clerk token (should return 401)
2. **Authorization**: Try accessing another user's todo (should return 404)
3. **Validation**: Send invalid data (should return 400 with details)
4. **Filtering**: Test all filter combinations
5. **Pagination**: Test with various limit/offset values
6. **Roadmap Integration**: Test creating from roadmap task
7. **Statistics**: Create various todos and check stats accuracy

### Automated Testing (Future)
- Unit tests for helper functions
- Integration tests for API endpoints
- E2E tests for complete workflows

---

## 📂 File Structure

```
src/
├── app/api/todos/
│   ├── route.ts                    # GET /api/todos, POST /api/todos
│   ├── [id]/
│   │   └── route.ts                # GET, PUT, DELETE /api/todos/[id]
│   ├── stats/
│   │   └── route.ts                # GET /api/todos/stats
│   └── from-roadmap/
│       └── route.ts                # POST, GET /api/todos/from-roadmap
├── lib/
│   ├── validations/
│   │   └── todo.ts                 # Zod schemas
│   └── todo-helpers.ts             # Helper functions
└── docs/
    ├── API_TODOS.md                # Complete API documentation
    └── PHASE2_TODO_SYSTEM.md      # This file
```

---

## ✅ Phase 2 Checklist

- ✅ Zod validation schemas for all operations
- ✅ Helper functions for queries and formatting
- ✅ GET /api/todos with filtering, search, sort, pagination
- ✅ POST /api/todos with validation
- ✅ GET /api/todos/[id]
- ✅ PUT /api/todos/[id] with partial updates
- ✅ DELETE /api/todos/[id] with soft/hard delete
- ✅ GET /api/todos/stats with comprehensive metrics
- ✅ POST /api/todos/from-roadmap for roadmap integration
- ✅ GET /api/todos/from-roadmap?roadmapId=X for roadmap todos
- ✅ Authentication and authorization on all endpoints
- ✅ Comprehensive API documentation
- ✅ TypeScript type safety (no compilation errors)

---

## 🎯 Next Steps: Phase 3

With the API layer complete, Phase 3 will focus on:

1. **Dashboard Integration**:
   - Todo widget on main dashboard
   - Statistics cards
   - Quick actions

2. **Dedicated Todos Page**:
   - List view with filters
   - Create/edit forms
   - Search functionality

3. **Roadmap Integration UI**:
   - "Convert to Todo" buttons on roadmap tasks
   - Visual indicators for linked todos
   - Quick view of related todos

4. **Todo Detail View**:
   - Edit inline
   - Manage tags
   - Link to roadmaps

---

## 📊 API Coverage

| HTTP Method | Endpoint | Purpose | Status |
|-------------|----------|---------|--------|
| GET | /api/todos | List with filters | ✅ |
| POST | /api/todos | Create new | ✅ |
| GET | /api/todos/[id] | Get single | ✅ |
| PUT | /api/todos/[id] | Update | ✅ |
| DELETE | /api/todos/[id] | Archive/Delete | ✅ |
| GET | /api/todos/stats | Statistics | ✅ |
| POST | /api/todos/from-roadmap | Convert task | ✅ |
| GET | /api/todos/from-roadmap | Roadmap todos | ✅ |

**Phase 2 Status**: ✅ **COMPLETE**

All API endpoints are implemented, validated, type-safe, and documented. Ready for Phase 3: Frontend Components.
