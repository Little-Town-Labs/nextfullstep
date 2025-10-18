import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRepository } from "@/lib/data-source";
import { CareerAssessmentEntity } from "@/entities/CareerAssessmentEntity";
import { RoadmapEntity } from "@/entities/RoadmapEntity";
import { RoadmapTaskEntity } from "@/entities/RoadmapTaskEntity";

/**
 * DELETE /api/assessment/[id]/delete
 * Deletes an assessment and all related data (roadmap, tasks)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get assessment and verify ownership
    const assessmentRepo = await getRepository(CareerAssessmentEntity);
    const assessment = await assessmentRepo.findOne({ where: { id } });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify the assessment belongs to the authenticated user
    if (assessment.userId !== clerkUserId) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this assessment" },
        { status: 403 }
      );
    }

    // Find and delete related roadmap and tasks
    const roadmapRepo = await getRepository(RoadmapEntity);
    const roadmap = await roadmapRepo.findOne({
      where: { assessmentId: id },
    });

    if (roadmap) {
      // Delete roadmap tasks first
      const taskRepo = await getRepository(RoadmapTaskEntity);
      await taskRepo.delete({ roadmapId: roadmap.id });
      console.log(`Deleted tasks for roadmap ${roadmap.id}`);

      // Delete roadmap
      await roadmapRepo.delete({ id: roadmap.id });
      console.log(`Deleted roadmap ${roadmap.id}`);
    }

    // Delete assessment
    await assessmentRepo.delete({ id });
    console.log(`Deleted assessment ${id}`);

    return NextResponse.json({
      success: true,
      message: "Assessment and related data deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment", message: error.message },
      { status: 500 }
    );
  }
}
