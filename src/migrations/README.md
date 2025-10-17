# Database Migrations

This directory contains TypeORM migrations for the NextFullStep database.

## Current Migrations

### 1700000000000-CreateUserTodoTables
Creates the todo tracking system tables:
- `user_todos`: Personal todos for users with AI integration
- `todo_reminders`: Reminder system for todos (future enhancement)

## Development Mode

Currently, `synchronize: true` is enabled in [data-source.ts](../lib/data-source.ts), which means:
- Tables are automatically created/updated based on entity definitions
- Migrations are not required in development
- Schema changes are applied automatically

## Production Mode

For production, disable `synchronize` and use migrations:

1. Update [data-source.ts](../lib/data-source.ts):
   ```typescript
   synchronize: false, // Disable auto-sync
   ```

2. Run migrations:
   ```bash
   npm run typeorm migration:run
   ```

3. Revert migrations (if needed):
   ```bash
   npm run typeorm migration:revert
   ```

## Creating New Migrations

To create a new migration:

```bash
npm run typeorm migration:create -- src/migrations/MigrationName
```

## Migration Best Practices

1. **Always test migrations** on a development database first
2. **Backup production data** before running migrations
3. **Write both up() and down() methods** for reversibility
4. **Use transactions** when possible
5. **Test rollback functionality** before production deployment

## Schema Overview

### user_todos Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (default: uuid_generate_v4()) |
| userId | UUID | Clerk user ID (indexed) |
| title | VARCHAR(255) | Todo title |
| description | TEXT | Detailed description |
| category | VARCHAR(50) | ai_suggested, personal_upskilling, general |
| priority | VARCHAR(50) | critical, high, normal, low |
| status | VARCHAR(50) | pending, in_progress, completed, archived (indexed) |
| linkedToRoadmapId | UUID | Link to roadmap (indexed, nullable) |
| linkedToTaskId | UUID | Link to roadmap task (indexed, nullable) |
| source | VARCHAR(50) | user_created, ai_chat_extraction, roadmap_derived |
| notes | TEXT | User notes |
| estimatedMinutes | INTEGER | Estimated completion time |
| tags | TEXT | JSON array of tags |
| dueDate | TIMESTAMP | Due date (indexed) |
| completedAt | TIMESTAMP | Completion timestamp |
| archivedAt | TIMESTAMP | Archive timestamp |
| createdAt | TIMESTAMP | Creation timestamp (default: CURRENT_TIMESTAMP) |
| updatedAt | TIMESTAMP | Last update timestamp (auto-updated via trigger) |

### todo_reminders Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (default: uuid_generate_v4()) |
| todoId | UUID | Foreign key to user_todos.id (indexed) |
| userId | UUID | Clerk user ID (indexed) |
| reminderTime | TIMESTAMP | When to send reminder (indexed) |
| frequency | VARCHAR(50) | once, daily, weekly, custom |
| method | VARCHAR(50) | email, push, in_app, all |
| status | VARCHAR(50) | pending, sent, failed, canceled |
| customMessage | VARCHAR(255) | Custom reminder message |
| sentAt | TIMESTAMP | When reminder was sent |
| attemptCount | INTEGER | Number of send attempts |
| errorMessage | TEXT | Error details if failed |
| createdAt | TIMESTAMP | Creation timestamp (default: CURRENT_TIMESTAMP) |
| updatedAt | TIMESTAMP | Last update timestamp (auto-updated via trigger) |

### Relationships

#### Foreign Key Constraints

**todo_reminders → user_todos**
- **Constraint**: `FK_TODO_REMINDERS_TODO_ID`
- **Column**: `todoId` → `user_todos.id`
- **Type**: MANY-TO-ONE (many reminders can belong to one todo)
- **Indexed**: Yes (on `todoId` for fast lookups)
- **ON DELETE CASCADE**: When a todo is deleted, all associated reminders are automatically deleted
- **Rationale**: Prevents orphaned reminders; reminders have no meaning without their parent todo
- **Performance**: Database-level cascade is more efficient than application-level cleanup

**todo_reminders → Clerk Users** (via userId)
- **Column**: `userId` (UUID)
- **Type**: Reference to Clerk user ID (external system)
- **Indexed**: Yes (on `userId` for user-specific queries)
- **ON DELETE**: No database-level constraint (Clerk manages users externally)
- **Application-Level**: Application code ensures userId exists before creating reminders
- **Cleanup**: Manual cleanup required if Clerk user is deleted

## Indexes

### user_todos
- `userId` - Fast user queries
- `status` - Filter by status
- `dueDate` - Sort by due date
- `linkedToRoadmapId` - Roadmap integration queries
- `linkedToTaskId` - Task integration queries

### todo_reminders
- `todoId` - Find reminders for a todo
- `userId` - User's reminders
- `reminderTime` - Scheduled reminders processing
