import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRepository } from "@/lib/data-source";
import { UserTodoEntity } from "@/entities/UserTodoEntity";
import { RoadmapTaskEntity } from "@/entities/RoadmapTaskEntity";
import { RoadmapEntity } from "@/entities/RoadmapEntity";
import { Repository } from "typeorm";
import { fromRoadmapSchema, FromRoadmapInput } from "@/lib/validations/todo";
import { formatTodoResponse } from "@/lib/todo-helpers";
import { ZodError } from "zod";

/**
 * From Roadmap API
 *
 * POST /api/todos/from-roadmap - Convert a roadmap task to a personal todo
 * GET /api/todos/from-roadmap?roadmapId=X - Get all todos linked to a roadmap
 */

/**
 * POST /api/todos/from-roadmap
 * Convert a roadmap task into a personal todo
 *
 * This creates a new todo linked to the roadmap task, allowing users to
 * track it separately with their own notes and customizations.
 *
 * Body:
 * - roadmapTaskId: UUID (required) - The task to convert
 * - customTitle: string (optional) - Override the task title
 * - customDescription: string (optional) - Override the task description
 * - priority: critical | high | normal | low (optional) - Override priority
 * - dueDate: ISO datetime (optional) - Set a due date
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
    const validatedData: FromRoadmapInput = fromRoadmapSchema.parse(body);

    // Get repositories
    const taskRepo = (await getRepository(RoadmapTaskEntity)) as Repository<RoadmapTaskEntity>;
    const todoRepo = (await getRepository(UserTodoEntity)) as Repository<UserTodoEntity>;
    const roadmapRepo = (await getRepository(RoadmapEntity)) as Repository<RoadmapEntity>;

    // Find the roadmap task
    const task = await taskRepo.findOne({
      where: { id: validatedData.roadmapTaskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Roadmap task not found" },
        { status: 404 }
      );
    }

    // Verify user owns the roadmap
    const roadmap = await roadmapRepo.findOne({
      where: { id: task.roadmapId },
    });

    if (!roadmap || roadmap.userId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to access this roadmap task" },
        { status: 403 }
      );
    }

    // Check if a todo already exists for this task
    const existingTodo = await todoRepo.findOne({
      where: { linkedToTaskId: task.id, userId },
    });

    if (existingTodo) {
      return NextResponse.json(
        {
          error: "A todo already exists for this roadmap task",
          data: formatTodoResponse(existingTodo),
        },
        { status: 409 } // Conflict
      );
    }

    // Map roadmap task priority to todo priority if not overridden
    const taskPriority = validatedData.priority || task.priority?.toLowerCase() || "normal";
    const validPriority = ["critical", "high", "normal", "low"].includes(taskPriority)
      ? (taskPriority as "critical" | "high" | "normal" | "low")
      : ("normal" as const);

    // Create the todo from the roadmap task
    const todo = todoRepo.create({
      userId,
      title: validatedData.customTitle || task.title,
      description: validatedData.customDescription || task.description,
      category: "personal_upskilling",
      priority: validPriority,
      source: "roadmap_derived",
      status: task.status === "completed" ? "completed" : "pending",
      estimatedMinutes: task.estimatedHours ? task.estimatedHours * 60 : undefined,
      dueDate: validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : task.targetDate
        ? new Date(task.targetDate)
        : undefined,
      linkedToRoadmapId: task.roadmapId,
      linkedToTaskId: task.id,
      notes: task.notes || undefined,
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    });

    // Save the todo
    const savedTodo = await todoRepo.save(todo);

    return NextResponse.json(
      {
        success: true,
        message: "Todo created from roadmap task",
        data: formatTodoResponse(savedTodo),
        roadmapTask: {
          id: task.id,
          title: task.title,
          roadmapId: task.roadmapId,
          status: task.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating todo from roadmap:", error);

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
        error: "Failed to create todo from roadmap task",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/todos/from-roadmap?roadmapId=X
 * Get all todos linked to a specific roadmap
 *
 * Query params:
 * - roadmapId: UUID (required) - The roadmap to get todos for
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

    const roadmapId = req.nextUrl.searchParams.get("roadmapId");

    if (!roadmapId) {
      return NextResponse.json(
        { error: "roadmapId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify user owns the roadmap
    const roadmapRepo = (await getRepository(RoadmapEntity)) as Repository<RoadmapEntity>;
    const roadmap = await roadmapRepo.findOne({
      where: { id: roadmapId },
    });

    if (!roadmap || roadmap.userId !== userId) {
      return NextResponse.json(
        { error: "Roadmap not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Get all todos linked to this roadmap
    const todoRepo = (await getRepository(UserTodoEntity)) as Repository<UserTodoEntity>;
    const todos = await todoRepo.find({
      where: { linkedToRoadmapId: roadmapId, userId },
      order: { createdAt: "DESC" },
    });

    return NextResponse.json({
      success: true,
      data: todos.map(formatTodoResponse),
      roadmap: {
        id: roadmap.id,
        roleName: roadmap.roleName,
        status: roadmap.status,
        progressPercentage: roadmap.progressPercentage,
      },
    });
  } catch (error: any) {
    console.error("Error fetching roadmap todos:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch roadmap todos",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
