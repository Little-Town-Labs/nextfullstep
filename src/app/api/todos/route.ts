import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRepository } from "@/lib/data-source";
import { UserTodoEntity } from "@/entities/UserTodoEntity";
import { Repository } from "typeorm";
import {
  createTodoSchema,
  todoQuerySchema,
  CreateTodoInput,
} from "@/lib/validations/todo";
import {
  queryTodosWithFilters,
  formatTodoResponse,
} from "@/lib/todo-helpers";
import { ZodError } from "zod";

/**
 * Todos API
 *
 * GET /api/todos - Get all todos for authenticated user with filters
 * POST /api/todos - Create new todo
 */

/**
 * GET /api/todos
 * Get todos with filtering, searching, sorting, and pagination
 *
 * Query params:
 * - status: pending | in_progress | completed | archived
 * - category: ai_suggested | personal_upskilling | general
 * - priority: critical | high | normal | low
 * - linkedToRoadmapId: UUID
 * - linkedToTaskId: UUID
 * - dueBefore: ISO datetime
 * - dueAfter: ISO datetime
 * - search: string (searches title and description)
 * - limit: number (default 50, max 100)
 * - offset: number (default 0)
 * - sortBy: createdAt | updatedAt | dueDate | priority | title (default createdAt)
 * - sortOrder: ASC | DESC (default DESC)
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      priority: searchParams.get("priority") || undefined,
      linkedToRoadmapId: searchParams.get("linkedToRoadmapId") || undefined,
      linkedToTaskId: searchParams.get("linkedToTaskId") || undefined,
      dueBefore: searchParams.get("dueBefore") || undefined,
      dueAfter: searchParams.get("dueAfter") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || "50",
      offset: searchParams.get("offset") || "0",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "DESC",
    };

    const filters = todoQuerySchema.parse(queryParams);

    // Get repository
    const todoRepo = (await getRepository(UserTodoEntity)) as Repository<UserTodoEntity>;

    // Query with filters
    const [todos, total] = await queryTodosWithFilters(todoRepo, filters, userId);

    return NextResponse.json({
      success: true,
      data: todos.map(formatTodoResponse),
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + filters.limit < total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching todos:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch todos",
        message: process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/todos
 * Create a new todo for the authenticated user
 *
 * Body:
 * - title: string (required)
 * - description: string (optional)
 * - category: ai_suggested | personal_upskilling | general (default: personal_upskilling)
 * - priority: critical | high | normal | low (default: normal)
 * - source: user_created | ai_chat_extraction | roadmap_derived (default: user_created)
 * - notes: string (optional)
 * - estimatedMinutes: number (optional)
 * - tags: string[] (optional)
 * - dueDate: ISO datetime (optional)
 * - linkedToRoadmapId: UUID (optional)
 * - linkedToTaskId: UUID (optional)
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData: CreateTodoInput = createTodoSchema.parse(body);

    // Get repository
    const todoRepo = (await getRepository(UserTodoEntity)) as Repository<UserTodoEntity>;

    // Create todo entity
    const todo = todoRepo.create({
      userId,
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      priority: validatedData.priority,
      source: validatedData.source,
      notes: validatedData.notes,
      estimatedMinutes: validatedData.estimatedMinutes,
      tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      linkedToRoadmapId: validatedData.linkedToRoadmapId,
      linkedToTaskId: validatedData.linkedToTaskId,
      status: "pending", // New todos start as pending
    });

    // Save to database
    const savedTodo = await todoRepo.save(todo);

    return NextResponse.json(
      {
        success: true,
        message: "Todo created successfully",
        data: formatTodoResponse(savedTodo),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating todo:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create todo",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
