import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/data-source";
import { RoadmapEntity } from "@/entities/RoadmapEntity";
import { RoadmapTaskEntity } from "@/entities/RoadmapTaskEntity";

/**
 * Roadmap API
 *
 * GET /api/roadmap?userId=X - Get all roadmaps for user
 * GET /api/roadmap?id=X - Get specific roadmap with tasks
 * GET /api/roadmap?assessmentId=X - Get roadmap by assessment
 */

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const roadmapId = searchParams.get("id");
    const userId = searchParams.get("userId");
    const assessmentId = searchParams.get("assessmentId");

    const roadmapRepo = await getRepository(RoadmapEntity);

    // Get specific roadmap with tasks
    if (roadmapId) {
      const roadmap = await roadmapRepo.findOne({
        where: { id: roadmapId },
      });

      if (!roadmap) {
        return NextResponse.json(
          { error: "Roadmap not found" },
          { status: 404 }
        );
      }

      // Get all tasks for this roadmap
      const taskRepo = await getRepository(RoadmapTaskEntity);
      const tasks = await taskRepo.find({
        where: { roadmapId },
        order: { phaseId: "ASC", sortOrder: "ASC" },
      });

      // Group tasks by phase
      const phaseMap = new Map<string, any[]>();
      for (const task of tasks) {
        if (!phaseMap.has(task.phaseId)) {
          phaseMap.set(task.phaseId, []);
        }
        phaseMap.get(task.phaseId)?.push({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          estimatedHours: task.estimatedHours,
          resources: task.resources ? JSON.parse(task.resources) : [],
          targetDate: task.targetDate,
          completedAt: task.completedAt,
          notes: task.notes,
        });
      }

      // Build phases array
      const phases = Array.from(phaseMap.entries()).map(([phaseId, tasks]) => ({
        phaseId,
        phaseName: tasks[0]?.phaseName || phaseId,
        tasks,
      }));

      return NextResponse.json({
        success: true,
        roadmap: {
          id: roadmap.id,
          userId: roadmap.userId,
          assessmentId: roadmap.assessmentId,
          roleId: roadmap.roleId,
          roleName: roadmap.roleName,
          status: roadmap.status,
          totalTasks: roadmap.totalTasks,
          completedTasks: roadmap.completedTasks,
          progressPercentage: roadmap.progressPercentage,
          daysActive: roadmap.daysActive,
          currentStreak: roadmap.currentStreak,
          longestStreak: roadmap.longestStreak,
          lastActivityDate: roadmap.lastActivityDate,
          targetCompletionDate: roadmap.targetCompletionDate,
          createdAt: roadmap.createdAt,
          updatedAt: roadmap.updatedAt,
          phases,
        },
      });
    }

    // Get roadmap by assessment ID
    if (assessmentId) {
      const roadmap = await roadmapRepo.findOne({
        where: { assessmentId },
      });

      if (!roadmap) {
        return NextResponse.json(
          { error: "Roadmap not found for this assessment" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        roadmap: {
          id: roadmap.id,
          assessmentId: roadmap.assessmentId,
          roleId: roadmap.roleId,
          roleName: roadmap.roleName,
          status: roadmap.status,
          totalTasks: roadmap.totalTasks,
          completedTasks: roadmap.completedTasks,
          progressPercentage: roadmap.progressPercentage,
        },
      });
    }

    // Get all roadmaps for user
    if (userId) {
      const roadmaps = await roadmapRepo.find({
        where: { userId },
        order: { createdAt: "DESC" },
      });

      return NextResponse.json({
        success: true,
        roadmaps: roadmaps.map((r) => ({
          id: r.id,
          roleId: r.roleId,
          roleName: r.roleName,
          status: r.status,
          totalTasks: r.totalTasks,
          completedTasks: r.completedTasks,
          progressPercentage: r.progressPercentage,
          currentStreak: r.currentStreak,
          createdAt: r.createdAt,
        })),
      });
    }

    return NextResponse.json(
      { error: "Missing required parameter (id, userId, or assessmentId)" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error fetching roadmap:", error);
    return NextResponse.json(
      { error: "Failed to fetch roadmap", message: error.message },
      { status: 500 }
    );
  }
}
