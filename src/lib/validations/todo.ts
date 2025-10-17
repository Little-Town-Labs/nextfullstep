import { z } from "zod";

/**
 * Validation schemas for Todo API operations
 */

// Category enum
export const todoCategorySchema = z.enum([
  "ai_suggested",
  "personal_upskilling",
  "general",
]);

// Priority enum
export const todoPrioritySchema = z.enum([
  "critical",
  "high",
  "normal",
  "low",
]);

// Status enum
export const todoStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "archived",
]);

// Source enum
export const todoSourceSchema = z.enum([
  "user_created",
  "ai_chat_extraction",
  "roadmap_derived",
]);

// Create todo schema
export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(5000, "Description too long").optional(),
  category: todoCategorySchema.default("personal_upskilling"),
  priority: todoPrioritySchema.default("normal"),
  source: todoSourceSchema.default("user_created"),
  notes: z.string().max(5000, "Notes too long").optional(),
  estimatedMinutes: z.number().int().positive().max(10000).optional(),
  tags: z.array(z.string()).max(20, "Too many tags").optional(),
  dueDate: z.string().datetime().optional(),
  linkedToRoadmapId: z.string().uuid().optional(),
  linkedToTaskId: z.string().uuid().optional(),
});

// Update todo schema (all fields optional except what you want to update)
export const updateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  category: todoCategorySchema.optional(),
  priority: todoPrioritySchema.optional(),
  status: todoStatusSchema.optional(),
  notes: z.string().max(5000).optional().nullable(),
  estimatedMinutes: z.number().int().positive().max(10000).optional().nullable(),
  tags: z.array(z.string()).max(20).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  linkedToRoadmapId: z.string().uuid().optional().nullable(),
  linkedToTaskId: z.string().uuid().optional().nullable(),
});

// Query filters schema
export const todoQuerySchema = z.object({
  userId: z.string().optional(), // Will be enforced by auth
  status: todoStatusSchema.optional(),
  category: todoCategorySchema.optional(),
  priority: todoPrioritySchema.optional(),
  linkedToRoadmapId: z.string().uuid().optional(),
  linkedToTaskId: z.string().uuid().optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  search: z.string().max(255).optional(), // Search in title/description
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(["createdAt", "updatedAt", "dueDate", "priority", "title"]).default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
});

// From roadmap schema
export const fromRoadmapSchema = z.object({
  roadmapTaskId: z.string().uuid("Invalid task ID"),
  customTitle: z.string().min(1).max(255).optional(),
  customDescription: z.string().max(5000).optional(),
  priority: todoPrioritySchema.optional(),
  dueDate: z.string().datetime().optional(),
});

// Types for TypeScript
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoQueryInput = z.infer<typeof todoQuerySchema>;
export type FromRoadmapInput = z.infer<typeof fromRoadmapSchema>;
