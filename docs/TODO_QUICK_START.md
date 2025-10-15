# Todo System - Quick Start Guide

Quick reference for working with the todo tracking system.

---

## 🚀 For Frontend Developers

### Using the API

All todo endpoints are at `/api/todos/*` and require Clerk authentication.

#### Get User's Todos

```typescript
const response = await fetch('/api/todos?status=pending&limit=20', {
  headers: {
    'Authorization': `Bearer ${clerkToken}`
  }
});

const { data, pagination } = await response.json();
// data: Todo[]
// pagination: { total, limit, offset, hasMore }
```

#### Create a Todo

```typescript
const response = await fetch('/api/todos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${clerkToken}`
  },
  body: JSON.stringify({
    title: "Learn TypeScript",
    category: "personal_upskilling",
    priority: "high",
    dueDate: "2025-12-31T23:59:59Z",    tags: ["typescript", "learning"]
  })
});

const { data } = await response.json();
// data: Todo
```

#### Update a Todo

```typescript
const response = await fetch(`/api/todos/${todoId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${clerkToken}`
  },
  body: JSON.stringify({
    status: "completed"
  })
});

const { data } = await response.json();
// completedAt is automatically set
```

#### Get Statistics

```typescript
const response = await fetch('/api/todos/stats', {
  headers: {
    'Authorization': `Bearer ${clerkToken}`
  }
});

const { data } = await response.json();
// data: { total, pending, completed, overdue, dueThisWeek, ... }
```

#### Convert Roadmap Task to Todo

```typescript
const response = await fetch('/api/todos/from-roadmap', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${clerkToken}`
  },
  body: JSON.stringify({
    roadmapTaskId: taskId,
    customTitle: "My version of this task",
    priority: "high"
  })
});

const { data } = await response.json();
// data: Todo (linked to roadmap)
```

---

## 🔍 Filtering & Sorting

### Available Filters

```typescript
interface TodoFilters {
  status?: 'pending' | 'in_progress' | 'completed' | 'archived';
  category?: 'ai_suggested' | 'personal_upskilling' | 'general';
  priority?: 'critical' | 'high' | 'normal' | 'low';
  linkedToRoadmapId?: string;
  linkedToTaskId?: string;
  dueBefore?: string; // ISO datetime
  dueAfter?: string; // ISO datetime
  search?: string;
  limit?: number; // max 100, default 50
  offset?: number; // default 0
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}
```

### Example Queries

**Get overdue todos:**
```
GET /api/todos?dueBefore=2025-12-31T00:00:00Z&status=pending```

**Search for "react":**
```
GET /api/todos?search=react
```

**Get high priority learning todos:**
```
GET /api/todos?category=personal_upskilling&priority=high
```

**Get todos for a roadmap:**
```
GET /api/todos/from-roadmap?roadmapId={uuid}
```

---

## 📦 Data Types

### Todo Object

```typescript
interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'ai_suggested' | 'personal_upskilling' | 'general';
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  source: 'user_created' | 'ai_chat_extraction' | 'roadmap_derived';
  notes?: string;
  estimatedMinutes?: number;
  tags: string[]; // Already parsed by API - frontend receives array
  dueDate?: string; // ISO datetime
  completedAt?: string; // ISO datetime (auto-set)
  archivedAt?: string; // ISO datetime (auto-set)
  linkedToRoadmapId?: string;
  linkedToTaskId?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}
```

### Stats Object

```typescript
interface TodoStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  archived: number;
  byCategory: {
    ai_suggested: number;
    personal_upskilling: number;
    general: number;
  };
  byPriority: {
    critical: number;
    high: number;
    normal: number;
    low: number;
  };
  overdue: number;
  dueThisWeek: number;
  linkedToRoadmaps: number;
  completionRate: number; // percentage
}
```

---

## 🎨 UI Component Ideas

### Todo Card Component

```tsx
interface TodoCardProps {
  todo: Todo;
  onComplete: (id: string) => void;
  onEdit: (id: string) => void;
}

function TodoCard({ todo, onComplete, onEdit }: TodoCardProps) {
  const priorityColors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    normal: 'bg-blue-100 text-blue-800',
    low: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{todo.title}</h3>
          <p className="text-sm text-gray-600">{todo.description}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${priorityColors[todo.priority]}`}>
          {todo.priority}
        </span>
      </div>
      {todo.dueDate && (
        <p className="text-xs text-gray-500 mt-2">
          Due: {new Date(todo.dueDate).toLocaleDateString()}
        </p>
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={() => onComplete(todo.id)}>Mark Complete</button>
        <button onClick={() => onEdit(todo.id)}>Edit</button>
      </div>
    </div>
  );
}
```

### Stats Dashboard Widget

```tsx
interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: string;
  highlight?: boolean;
}

function StatCard({ title, value, icon, highlight = false }: StatCardProps) {
  return (
    <article
      role="group"
      className={`
        border rounded-lg p-4
        ${highlight ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
        transition-colors
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-red-700' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        {icon && (
          <span className="text-3xl ml-3" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
    </article>
  );
}

function TodoStatsWidget({ stats }: { stats: TodoStats }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        title="Pending"
        value={stats.pending}
        icon="📝"
      />
      <StatCard
        title="In Progress"
        value={stats.inProgress}
        icon="⚡"
      />
      <StatCard
        title="Completed"
        value={stats.completed}
        icon="✅"
      />
      <StatCard
        title="Overdue"
        value={stats.overdue}
        icon="⚠️"
        highlight={stats.overdue > 0}
      />
      <StatCard
        title="Due This Week"
        value={stats.dueThisWeek}
        icon="📅"
      />
      <StatCard
        title="Completion Rate"
        value={`${stats.completionRate}%`}
        icon="📊"
      />
    </div>
  );
}
```

---

## 🔧 Backend Integration

### Using Repositories Directly

```typescript
import { getRepository } from "@/lib/data-source";
import { UserTodoEntity } from "@/entities/UserTodoEntity";
import { Repository } from "typeorm";

// In your API route or server component
const todoRepo = (await getRepository(UserTodoEntity)) as Repository<UserTodoEntity>;

// Query todos
const todos = await todoRepo.find({
  where: { userId, status: "pending" },
  order: { dueDate: "ASC" },
  take: 10
});
```

### Using Helper Functions

```typescript
import { calculateTodoStats, formatTodoResponse } from "@/lib/todo-helpers";

// Get statistics
const stats = await calculateTodoStats(todoRepo, userId);

// Format todos for API response
const formattedTodos = todos.map(formatTodoResponse);
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Create todo with all fields
- [ ] Create todo with minimum fields
- [ ] Update todo status to completed (check completedAt)
- [ ] Update todo status to archived (check archivedAt)
- [ ] Soft delete todo (archive)
- [ ] Hard delete todo with ?permanent=true
- [ ] Filter by status
- [ ] Filter by category
- [ ] Filter by priority
- [ ] Search todos
- [ ] Sort by due date
- [ ] Sort by priority
- [ ] Pagination (test hasMore)
- [ ] Create todo from roadmap task
- [ ] View todos for a roadmap
- [ ] View statistics
- [ ] Test overdue calculation
- [ ] Test due this week calculation

### Error Cases to Test

- [ ] Create todo without authentication (401)
- [ ] Access another user's todo (404)
- [ ] Create todo with invalid data (400)
- [ ] Create todo from non-existent roadmap task (404)
- [ ] Create todo from roadmap user doesn't own (403)
- [ ] Duplicate todo from same roadmap task (409)

---

## 📝 Common Patterns

### Fetching Todos with React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

function useTodos(filters: TodoFilters) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['todos', filters],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/todos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch todos');
      return response.json();
    }
  });
}

// Usage
function TodoList() {
  const { data, isLoading } = useTodos({ status: 'pending', limit: 20 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data.data.map(todo => (
        <TodoCard key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
```

### Creating Todo with Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

function useCreateTodo() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (newTodo: CreateTodoInput) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTodo)
      });
      if (!response.ok) throw new Error('Failed to create todo');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todo-stats'] });
    }
  });
}
```

---

## 🚨 Gotchas & Tips

1. **Timestamps are auto-managed**: Don't manually set `completedAt` or `archivedAt` - they're set automatically when status changes

2. **Tags Parsing** (Backend vs Frontend):
   - **Database Layer**: Tags are stored as JSON strings in the `user_todos.tags` column (PostgreSQL TEXT type)
   - **Backend Code**: When reading directly from DB with TypeORM, parse with `JSON.parse(todo.tags)`
   - **API Layer**: The `formatTodoResponse()` helper automatically parses tags before returning responses
   - **Frontend/API Consumers**: Receive `tags: string[]` already parsed - **no JSON.parse() needed**

   ```typescript
   // ❌ Don't do this in frontend:
   const tags = JSON.parse(todo.tags);

   // ✅ Tags are already an array from API:
   const tags = todo.tags; // string[]
   ```

3. **Soft delete by default**: Use DELETE without `?permanent=true` to archive instead of delete

4. **Pagination**: Always specify `limit` to avoid large payloads (max 100)

5. **Roadmap linking**: Check for existing todos before creating from roadmap task (409 conflict)

6. **Search is case-insensitive**: Uses ILIKE in PostgreSQL

7. **Date filters are inclusive**: `dueBefore` includes the exact datetime specified

---

## 📚 Additional Resources

- [Complete API Documentation](./API_TODOS.md)
- [Phase 2 Implementation Details](./PHASE2_TODO_SYSTEM.md)
- [Database Schema](./PHASE1_TODO_SYSTEM.md)
- [Validation Schemas](../src/lib/validations/todo.ts)

---

**Need help?** Check the detailed documentation or examine the test script at [src/scripts/test-todo-entities.ts](../src/scripts/test-todo-entities.ts)
