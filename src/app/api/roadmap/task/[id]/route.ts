import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/data-source";
import { RoadmapTaskEntity } from "@/entities/RoadmapTaskEntity";
import { RoadmapEntity } from "@/entities/RoadmapEntity";

/**
 * Roadmap Task Update API
 *
 * PUT /api/roadmap/task/[id] - Update task status, notes, or other fields
 */

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, notes, targetDate } = body;

    const taskRepo = await getRepository(RoadmapTaskEntity);
    const task = await taskRepo.findOne({ where: { id } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const wasCompleted = task.status === "completed";
    const nowCompleted = status === "completed";

    // Update task fields
    if (status) {
      task.status = status;

      // Set completedAt timestamp
      if (nowCompleted && !wasCompleted) {
        task.completedAt = new Date();
      } else if (!nowCompleted) {
        task.completedAt = undefined;
      }
    }

    if (notes !== undefined) {
      task.notes = notes;
    }

    if (targetDate !== undefined) {
      task.targetDate = targetDate ? new Date(targetDate) : undefined;
    }

    await taskRepo.save(task);

    // Update roadmap progress
    const roadmapRepo = await getRepository(RoadmapEntity);
    const roadmap = await roadmapRepo.findOne({
      where: { id: task.roadmapId },
    });

    if (roadmap) {
      // Count completed tasks
      const allTasks = await taskRepo.find({
        where: { roadmapId: task.roadmapId },
      });

      const completedCount = allTasks.filter(
        (t) => t.status === "completed"
      ).length;

      roadmap.completedTasks = completedCount;
      roadmap.progressPercentage = Math.round(
        (completedCount / roadmap.totalTasks) * 100
      );
      roadmap.lastActivityDate = new Date();

      // Calculate streak (simplified - days with activity)
      // In production, you'd track this more accurately
      if (nowCompleted && !wasCompleted) {
        const today = new Date().toDateString();
        const lastActivity = roadmap.lastActivityDate
          ? new Date(roadmap.lastActivityDate).toDateString()
          : null;

        if (lastActivity === today) {
          // Same day activity - streak continues
        } else {
          // New day activity
          roadmap.currentStreak += 1;
          if (roadmap.currentStreak > roadmap.longestStreak) {
            roadmap.longestStreak = roadmap.currentStreak;
          }
        }
      }

      await roadmapRepo.save(roadmap);
    }

    return NextResponse.json({
      success: true,
      message: "Task updated",
      task: {
        id: task.id,
        status: task.status,
        completedAt: task.completedAt,
        notes: task.notes,
      },
      roadmapProgress: roadmap
        ? {
            completedTasks: roadmap.completedTasks,
            totalTasks: roadmap.totalTasks,
            progressPercentage: roadmap.progressPercentage,
            currentStreak: roadmap.currentStreak,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/roadmap/task/[id] - Get specific task details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const taskRepo = await getRepository(RoadmapTaskEntity);
    const task = await taskRepo.findOne({ where: { id } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        roadmapId: task.roadmapId,
        phaseId: task.phaseId,
        phaseName: task.phaseName,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        estimatedHours: task.estimatedHours,
        resources: task.resources ? JSON.parse(task.resources) : [],
        notes: task.notes,
        targetDate: task.targetDate,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task", message: error.message },
      { status: 500 }
    );
  }
}
