import { Repository } from "typeorm";
import { UserTodoEntity } from "@/entities/UserTodoEntity";
import { TodoQueryInput } from "@/lib/validations/todo";

/**
 * Helper functions for todo operations
 */

/**
 * Build where clause for todo queries with filters
 */
export function buildTodoWhereClause(filters: TodoQueryInput, userId: string) {
  const where: any = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.linkedToRoadmapId) {
    where.linkedToRoadmapId = filters.linkedToRoadmapId;
  }

  if (filters.linkedToTaskId) {
    where.linkedToTaskId = filters.linkedToTaskId;
  }

  return where;
}

/**
 * Apply date range filters and search using query builder
 */
export async function queryTodosWithFilters(
  todoRepo: Repository<UserTodoEntity>,
  filters: TodoQueryInput,
  userId: string
) {
  const queryBuilder = todoRepo
    .createQueryBuilder("todo")
    .where("todo.userId = :userId", { userId });

  // Status filter
  if (filters.status) {
    queryBuilder.andWhere("todo.status = :status", { status: filters.status });
  }

  // Category filter
  if (filters.category) {
    queryBuilder.andWhere("todo.category = :category", { category: filters.category });
  }

  // Priority filter
  if (filters.priority) {
    queryBuilder.andWhere("todo.priority = :priority", { priority: filters.priority });
  }

  // Roadmap link filter
  if (filters.linkedToRoadmapId) {
    queryBuilder.andWhere("todo.linkedToRoadmapId = :roadmapId", {
      roadmapId: filters.linkedToRoadmapId,
    });
  }

  // Task link filter
  if (filters.linkedToTaskId) {
    queryBuilder.andWhere("todo.linkedToTaskId = :taskId", {
      taskId: filters.linkedToTaskId,
    });
  }

  // Due date range filters
  if (filters.dueBefore) {
    queryBuilder.andWhere("todo.dueDate <= :dueBefore", {
      dueBefore: new Date(filters.dueBefore),
    });
  }

  if (filters.dueAfter) {
    queryBuilder.andWhere("todo.dueDate >= :dueAfter", {
      dueAfter: new Date(filters.dueAfter),
    });
  }

  // Search in title and description
  if (filters.search) {
    queryBuilder.andWhere(
      "(todo.title ILIKE :search OR todo.description ILIKE :search)",
      { search: `%${filters.search}%` }
    );
  }

  // Sorting
  // Validate sortBy against allowed columns
  const allowedSortColumns = ['title', 'dueDate', 'priority', 'status', 'createdAt', 'updatedAt'];
  if (!allowedSortColumns.includes(filters.sortBy)) {
    throw new Error(`Invalid sort column: ${filters.sortBy}`);
  }

  // Validate sortOrder
  const allowedSortOrders = ['ASC', 'DESC'] as const;
  if (!allowedSortOrders.includes(filters.sortOrder)) {
    throw new Error(`Invalid sort order: ${filters.sortOrder}`);
  }

  // Sorting
  const sortColumn = `todo.${filters.sortBy}`;
  queryBuilder.orderBy(sortColumn, filters.sortOrder);
  // Pagination
  queryBuilder.skip(filters.offset).take(filters.limit);

  return queryBuilder.getManyAndCount();
}

/**
 * Calculate todo statistics for a user
 */
export async function calculateTodoStats(
  todoRepo: Repository<UserTodoEntity>,
  userId: string
) {
  const todos = await todoRepo.find({ where: { userId } });

  const stats = {
    total: todos.length,
    pending: todos.filter((t) => t.status === "pending").length,
    inProgress: todos.filter((t) => t.status === "in_progress").length,
    completed: todos.filter((t) => t.status === "completed").length,
    archived: todos.filter((t) => t.status === "archived").length,
    byCategory: {
      ai_suggested: todos.filter((t) => t.category === "ai_suggested").length,
      personal_upskilling: todos.filter((t) => t.category === "personal_upskilling").length,
      general: todos.filter((t) => t.category === "general").length,
    },
    byPriority: {
      critical: todos.filter((t) => t.priority === "critical").length,
      high: todos.filter((t) => t.priority === "high").length,
      normal: todos.filter((t) => t.priority === "normal").length,
      low: todos.filter((t) => t.priority === "low").length,
    },
    overdue: todos.filter(
      (t) =>
        t.dueDate &&
        t.status !== "completed" &&
        t.status !== "archived" &&
        new Date(t.dueDate) < new Date()
    ).length,
    dueThisWeek: todos.filter((t) => {
      if (!t.dueDate || t.status === "completed" || t.status === "archived") {
        return false;
      }
      const dueDate = new Date(t.dueDate);
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate >= now && dueDate <= weekFromNow;
    }).length,
    linkedToRoadmaps: todos.filter((t) => t.linkedToRoadmapId).length,
    completionRate:
      todos.length > 0
        ? Math.round((todos.filter((t) => t.status === "completed").length / todos.length) * 100)
        : 0,
  };

  return stats;
}

/**
 * Safely parse tags JSON, returning empty array on error
 */
function parseTags(tags: string | null | undefined): string[] {
  if (!tags) {
    return [];
  }

  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse tags JSON:", error);
    return [];
  }
}

/**
 * Format todo for API response
 */
export function formatTodoResponse(todo: UserTodoEntity) {
  return {
    id: todo.id,
    userId: todo.userId,
    title: todo.title,
    description: todo.description,
    category: todo.category,
    priority: todo.priority,
    status: todo.status,
    source: todo.source,
    notes: todo.notes,
    estimatedMinutes: todo.estimatedMinutes,
    tags: parseTags(todo.tags),
    dueDate: todo.dueDate,
    completedAt: todo.completedAt,
    archivedAt: todo.archivedAt,
    linkedToRoadmapId: todo.linkedToRoadmapId,
    linkedToTaskId: todo.linkedToTaskId,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  };
}

/**
 * Priority ranking for sorting (higher = more important)
 */
export function getPriorityRank(priority: string): number {
  const ranks: Record<string, number> = {
    critical: 4,
    high: 3,
    normal: 2,
    low: 1,
  };
  return ranks[priority] || 0;
}
