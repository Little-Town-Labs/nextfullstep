import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRepository } from "@/lib/data-source";
import { UserTodoEntity } from "@/entities/UserTodoEntity";
import { Repository } from "typeorm";
import { calculateTodoStats } from "@/lib/todo-helpers";

/**
 * Todo Statistics API
 *
 * GET /api/todos/stats - Get comprehensive statistics about user's todos
 */

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

/**
 * GET /api/todos/stats
 * Get statistics for the authenticated user's todos
 *
 * Returns:
 * - total: Total number of todos
 * - pending: Number of pending todos
 * - inProgress: Number of in-progress todos
 * - completed: Number of completed todos
 * - archived: Number of archived todos
 * - byCategory: Breakdown by category
 * - byPriority: Breakdown by priority
 * - overdue: Number of overdue todos
 * - dueThisWeek: Number of todos due this week
 * - linkedToRoadmaps: Number of todos linked to roadmaps
 * - completionRate: Percentage of completed todos
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

    // Get repository
    const todoRepo = (await getRepository(UserTodoEntity)) as Repository<UserTodoEntity>;

    // Calculate statistics
    const stats = await calculateTodoStats(todoRepo, userId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    console.error("Error fetching todo stats:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      {
        error: "Failed to fetch todo statistics",
        ...(process.env.NODE_ENV === "development" && { message }),
      },
      { status: 500 }
    );
  }}
