import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRepository } from "@/lib/data-source";
import { UserTodoEntity } from "@/entities/UserTodoEntity";
import { Repository } from "typeorm";
import { updateTodoSchema, UpdateTodoInput } from "@/lib/validations/todo";
import { formatTodoResponse } from "@/lib/todo-helpers";
import { ZodError } from "zod";

/**
 * Individual Todo API
 *
 * GET /api/todos/[id] - Get specific todo
 * PUT /api/todos/[id] - Update todo
 * DELETE /api/todos/[id] - Delete or archive todo
 */

/**
 * GET /api/todos/[id]
 * Get a specific todo by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get repository
    const todoRepo = (await getRepository(UserTodoEntity)) as Repository<UserTodoEntity>;

    // Find todo
    const todo = await todoRepo.findOne({
      where: { id, userId }, // Ensure user owns this todo
    });

    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatTodoResponse(todo),
    });
  } catch (error: any) {
    console.error("Error fetching todo:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch todo",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/todos/[id]
 * Update a todo
 *
 * Body (all optional):
 * - title: string
 * - description: string | null
 * - category: ai_suggested | personal_upskilling | general
 * - priority: critical | high | normal | low
 * - status: pending | in_progress | completed | archived
 * - notes: string | null
 * - estimatedMinutes: number | null
 * - tags: string[]
 * - dueDate: ISO datetime | null
 * - linkedToRoadmapId: UUID | null
 * - linkedToTaskId: UUID | null
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Parse and validate request body
    const body = await req.json();
    const validatedData: UpdateTodoInput = updateTodoSchema.parse(body);

    // Get repository
    const todoRepo = (await getRepository(UserTodoEntity)) as Repository<UserTodoEntity>;

    // Find todo
    const todo = await todoRepo.findOne({
      where: { id, userId }, // Ensure user owns this todo
    });

    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }

    // Track status change for completion timestamp
    const wasCompleted = todo.status === "completed";
    const nowCompleted = validatedData.status === "completed";
    const wasArchived = todo.status === "archived";
    const nowArchived = validatedData.status === "archived";

    // Update fields
    if (validatedData.title !== undefined) {
      todo.title = validatedData.title;
    }

    if (validatedData.description !== undefined) {
      todo.description = validatedData.description || undefined;
    }

    if (validatedData.category !== undefined) {
      todo.category = validatedData.category;
    }

    if (validatedData.priority !== undefined) {
      todo.priority = validatedData.priority;
    }

    if (validatedData.status !== undefined) {
      todo.status = validatedData.status;

      // Set completedAt timestamp
      if (nowCompleted && !wasCompleted) {
        todo.completedAt = new Date();
      } else if (!nowCompleted && wasCompleted) {
        todo.completedAt = undefined;
      }

      // Set archivedAt timestamp
      if (nowArchived && !wasArchived) {
        todo.archivedAt = new Date();
      } else if (!nowArchived && wasArchived) {
        todo.archivedAt = undefined;
      }
    }

    if (validatedData.notes !== undefined) {
      todo.notes = validatedData.notes || undefined;
    }

    if (validatedData.estimatedMinutes !== undefined) {
      todo.estimatedMinutes = validatedData.estimatedMinutes || undefined;
    }

    if (validatedData.tags !== undefined) {
      todo.tags = validatedData.tags.length > 0 ? JSON.stringify(validatedData.tags) : undefined;
    }

    if (validatedData.dueDate !== undefined) {
      todo.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : undefined;
    }

    if (validatedData.linkedToRoadmapId !== undefined) {
      todo.linkedToRoadmapId = validatedData.linkedToRoadmapId || undefined;
    }

    if (validatedData.linkedToTaskId !== undefined) {
      todo.linkedToTaskId = validatedData.linkedToTaskId || undefined;
    }

    // Save updated todo
    const updatedTodo = await todoRepo.save(todo);

    return NextResponse.json({
      success: true,
      message: "Todo updated successfully",
      data: formatTodoResponse(updatedTodo),
    });
  } catch (error: any) {
    console.error("Error updating todo:", error);

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
        error: "Failed to update todo",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/todos/[id]
 * Delete or archive a todo
 *
 * Query params:
 * - permanent: true | false (default false)
 *   If false, archives the todo. If true, permanently deletes it.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const permanent = req.nextUrl.searchParams.get("permanent") === "true";

    // Get repository
    const todoRepo = (await getRepository(UserTodoEntity)) as Repository<UserTodoEntity>;

    // Find todo
    const todo = await todoRepo.findOne({
      where: { id, userId }, // Ensure user owns this todo
    });

    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }

    if (permanent) {
      // Permanently delete
      await todoRepo.remove(todo);

      return NextResponse.json({
        success: true,
        message: "Todo permanently deleted",
      });
    } else {
      // Archive instead of delete (soft delete)
      todo.status = "archived";
      todo.archivedAt = new Date();
      await todoRepo.save(todo);

      return NextResponse.json({
        success: true,
        message: "Todo archived successfully",
        data: formatTodoResponse(todo),
      });
    }
  } catch (error: any) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      {
        error: "Failed to delete todo",
      },
      { status: 500 }
    );
  }
}