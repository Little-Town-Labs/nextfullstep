# Todo API Documentation

Complete API reference for the todo tracking system.

---

## Authentication

All endpoints require authentication via Clerk. Include the Clerk session token in your requests.

**Headers:**
```
Authorization: Bearer <clerk_token>
```

---

## Endpoints

### 1. List Todos

**GET** `/api/todos`

Get all todos for the authenticated user with filtering, searching, sorting, and pagination.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| status | string | Filter by status: `pending`, `in_progress`, `completed`, `archived` | - |
| category | string | Filter by category: `ai_suggested`, `personal_upskilling`, `general`, `roadmap_derived` | - || priority | string | Filter by priority: `critical`, `high`, `normal`, `low` | - |
| linkedToRoadmapId | UUID | Filter by linked roadmap | - |
| linkedToTaskId | UUID | Filter by linked roadmap task | - |
| dueBefore | ISO datetime | Todos due before this date | - |
| dueAfter | ISO datetime | Todos due after this date | - |
| search | string | Search in title and description | - |
| limit | number | Results per page (max 100) | 50 |
| offset | number | Pagination offset | 0 |
| sortBy | string | Sort field: `createdAt`, `updatedAt`, `dueDate`, `priority`, `title` | createdAt |
| sortOrder | string | Sort direction: `ASC`, `DESC` | DESC |

**Example Request:**
```bash
GET /api/todos?status=pending&priority=high&limit=20&sortBy=dueDate&sortOrder=ASC
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "clerk_user_id",
      "title": "Complete TypeScript tutorial",
      "description": "Learn advanced TypeScript concepts",
      "category": "personal_upskilling",
      "priority": "high",
      "status": "pending",
      "source": "user_created",
      "notes": "Focus on generics and decorators",
      "estimatedMinutes": 180,
      "tags": ["typescript", "learning"],
      "dueDate": "2024-12-31T23:59:59Z",
      "completedAt": null,
      "archivedAt": null,
      "linkedToRoadmapId": null,
      "linkedToTaskId": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 2. Get Single Todo

**GET** `/api/todos/[id]`

Get a specific todo by ID.

**Path Parameters:**
- `id` (UUID) - The todo ID

**Example Request:**
```bash
GET /api/todos/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Complete TypeScript tutorial",
    // ... other fields
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Todo not found or doesn't belong to user

---

### 3. Create Todo

**POST** `/api/todos`

Create a new todo for the authenticated user.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | Todo title (max 255 chars) |
| description | string | ❌ | Detailed description (max 5000 chars) |
| category | enum | ❌ | `ai_suggested`, `personal_upskilling`, `general` (default: `personal_upskilling`) |
| priority | enum | ❌ | `critical`, `high`, `normal`, `low` (default: `normal`) |
| source | enum | ❌ | `user_created`, `ai_chat_extraction`, `roadmap_derived` (default: `user_created`) |
| notes | string | ❌ | Additional notes (max 5000 chars) |
| estimatedMinutes | number | ❌ | Estimated time to complete (max 10000) |
| tags | string[] | ❌ | Array of tags (max 20 tags) |
| dueDate | ISO datetime | ❌ | Due date |
| linkedToRoadmapId | UUID | ❌ | Link to roadmap |
| linkedToTaskId | UUID | ❌ | Link to roadmap task |

**Example Request:**
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Learn Docker basics",
  "description": "Complete Docker fundamentals course",
  "category": "personal_upskilling",
  "priority": "high",
  "estimatedMinutes": 240,
  "tags": ["docker", "devops", "containers"],
  "dueDate": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": "new-uuid",
    "title": "Learn Docker basics",
    "status": "pending",
    // ... other fields
  }
}
```

**Error Responses:**
- `400` - Invalid request data (validation errors)
- `401` - Unauthorized

---

### 4. Update Todo

**PUT** `/api/todos/[id]`

Update a todo. All fields are optional.

**Path Parameters:**
- `id` (UUID) - The todo ID

**Request Body:** (all optional)

| Field | Type | Description |
|-------|------|-------------|
| title | string | Update title |
| description | string \| null | Update description |
| category | enum | Update category |
| priority | enum | Update priority |
| status | enum | Update status (automatically sets `completedAt`/`archivedAt`) |
| notes | string \| null | Update notes |
| estimatedMinutes | number \| null | Update estimated time |
| tags | string[] | Update tags |
| dueDate | ISO datetime \| null | Update due date |
| linkedToRoadmapId | UUID \| null | Update roadmap link |
| linkedToTaskId | UUID \| null | Update task link |

**Example Request:**
```bash
PUT /api/todos/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "status": "completed",
  "notes": "Finished! Great tutorial."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "completed",
    "completedAt": "2024-01-15T10:30:00Z",
    // ... other fields
  }
}
```

**Error Responses:**
- `400` - Invalid request data
- `401` - Unauthorized
- `404` - Todo not found

---

### 5. Delete/Archive Todo

**DELETE** `/api/todos/[id]`

Delete or archive a todo.

**Path Parameters:**
- `id` (UUID) - The todo ID

**Query Parameters:**
- `permanent` (boolean) - If `true`, permanently deletes. If `false` or omitted, archives (soft delete). Default: `false`

**Example Requests:**

Archive (soft delete):
```bash
DELETE /api/todos/123e4567-e89b-12d3-a456-426614174000
```

Permanent delete:
```bash
DELETE /api/todos/123e4567-e89b-12d3-a456-426614174000?permanent=true
```

**Response (Archive):**
```json
{
  "success": true,
  "message": "Todo archived successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "archived",
    "archivedAt": "2024-01-15T10:30:00Z",
    // ... other fields
  }
}
```

**Response (Permanent):**
```json
{
  "success": true,
  "message": "Todo permanently deleted"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Todo not found

---

### 6. Get Statistics

**GET** `/api/todos/stats`

Get comprehensive statistics about the user's todos.

**Example Request:**
```bash
GET /api/todos/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "pending": 15,
    "inProgress": 8,
    "completed": 17,
    "archived": 2,
    "byCategory": {
      "ai_suggested": 5,
      "personal_upskilling": 32,
      "general": 5
    },
    "byPriority": {
      "critical": 3,
      "high": 12,
      "normal": 22,
      "low": 5
    },
    "overdue": 4,
    "dueThisWeek": 7,
    "linkedToRoadmaps": 18,
    "completionRate": 40
  }
}
```

---

### 7. Create Todo from Roadmap Task

**POST** `/api/todos/from-roadmap`

Convert a roadmap task into a personal todo. This creates a linked todo that can be tracked independently.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| roadmapTaskId | UUID | ✅ | The roadmap task to convert |
| customTitle | string | ❌ | Override the task title |
| customDescription | string | ❌ | Override the task description |
| priority | enum | ❌ | Override priority |
| dueDate | ISO datetime | ❌ | Set a due date |

**Example Request:**
```bash
POST /api/todos/from-roadmap
Content-Type: application/json

{
  "roadmapTaskId": "task-uuid",
  "customTitle": "My version of this task",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo created from roadmap task",
  "data": {
    "id": "new-todo-uuid",
    "title": "My version of this task",
    "category": "roadmap_derived",
    "category": "personal_upskilling",
    "source": "roadmap_derived",    "linkedToTaskId": "task-uuid",
    // ... other fields
  },
  "roadmapTask": {
    "id": "task-uuid",
    "title": "Original task title",
    "roadmapId": "roadmap-uuid",
    "status": "pending"
  }
}
```

**Error Responses:**
- `400` - Invalid request data
- `401` - Unauthorized
- `403` - User doesn't own the roadmap
- `404` - Roadmap task not found
- `409` - Todo already exists for this task

---

### 8. Get Roadmap-Linked Todos

**GET** `/api/todos/from-roadmap?roadmapId=X`

Get all todos linked to a specific roadmap.

**Query Parameters:**
- `roadmapId` (UUID) - Required

**Example Request:**
```bash
GET /api/todos/from-roadmap?roadmapId=roadmap-uuid
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "todo-uuid",
      "title": "Todo linked to roadmap",
      "linkedToRoadmapId": "roadmap-uuid",
      "linkedToTaskId": "task-uuid",
      // ... other fields
    }
  ],
  "roadmap": {
    "id": "roadmap-uuid",
    "roleName": "AI Prompt Engineer",
    "status": "active",
    "progressPercentage": 45
  }
}
```

**Error Responses:**
- `400` - Missing roadmapId parameter
- `401` - Unauthorized
- `404` - Roadmap not found or doesn't belong to user

---

## Data Models

### Todo Object

```typescript
{
  id: string;                    // UUID
  userId: string;                // Clerk user ID
  title: string;                 // Max 255 chars
  description?: string;          // Max 5000 chars
  category: "ai_suggested" | "personal_upskilling" | "general";
  priority: "critical" | "high" | "normal" | "low";
  status: "pending" | "in_progress" | "completed" | "archived";
  source: "user_created" | "ai_chat_extraction" | "roadmap_derived";
  notes?: string;                // Max 5000 chars
  estimatedMinutes?: number;     // Max 10000
  tags: string[];                // Max 20 tags
  dueDate?: string;              // ISO datetime
  completedAt?: string;          // ISO datetime (auto-set)
  archivedAt?: string;           // ISO datetime (auto-set)
  linkedToRoadmapId?: string;    // UUID
  linkedToTaskId?: string;       // UUID
  createdAt: string;             // ISO datetime
  updatedAt: string;             // ISO datetime
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "details": []  // Optional: validation errors
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no auth token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

---

## Rate Limiting

Consider implementing rate limiting in production:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## Best Practices

1. **Pagination**: Always use pagination for list endpoints
2. **Filtering**: Combine filters to narrow results
3. **Soft Delete**: Use archive instead of permanent delete
4. **Status Updates**: Let the API handle timestamp fields
5. **Search**: Use the search parameter for text queries
6. **Roadmap Linking**: Check for existing todos before creating from roadmap

---

## Example Use Cases

### 1. Get All Pending High-Priority Todos
```bash
GET /api/todos?status=pending&priority=high
```

### 2. Get Overdue Todos
```bash
GET /api/todos?dueBefore=2024-01-15T23:59:59Z&status=pending
```

### 3. Create Learning Todo
```bash
POST /api/todos
{
  "title": "Master React Hooks",
  "category": "personal_upskilling",
  "priority": "high",
  "tags": ["react", "javascript", "frontend"],
  "estimatedMinutes": 300
}
```

### 4. Mark Todo as Completed
```bash
PUT /api/todos/[id]
{
  "status": "completed"
}
```

### 5. Get Personal Upskilling Statistics
```bash
GET /api/todos?category=personal_upskilling
GET /api/todos/stats
```
