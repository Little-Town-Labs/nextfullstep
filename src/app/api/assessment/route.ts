import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/data-source";
import { CareerAssessmentEntity } from "@/entities/CareerAssessmentEntity";
import { CareerRoleEntity } from "@/entities/CareerRoleEntity";

/**
 * Assessment API Routes
 *
 * POST /api/assessment - Start new assessment
 * GET /api/assessment?userId=X&roleId=Y - Get user's assessment for role
 */

// Start new assessment
export async function POST(req: NextRequest) {
  try {
    const { userId, roleId } = await req.json();

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: "Missing userId or roleId" },
        { status: 400 }
      );
    }

    // Get role details
    const roleRepo = await getRepository(CareerRoleEntity);
    const role = await roleRepo.findOne({ where: { id: roleId } });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Check if user already has an assessment for this role
    const assessmentRepo = await getRepository(CareerAssessmentEntity);
    const existing = await assessmentRepo.findOne({
      where: { userId, roleId, status: "in_progress" },
    });

    if (existing) {
      // Return existing assessment
      return NextResponse.json({
        success: true,
        assessment: {
          id: existing.id,
          roleId: existing.roleId,
          roleName: existing.roleName,
          status: existing.status,
          currentQuestionNumber: existing.currentQuestionNumber,
          responses: existing.responses ? JSON.parse(existing.responses) : [],
        },
        message: "Resuming existing assessment",
      });
    }

    // Create new assessment
    const assessment = assessmentRepo.create({
      userId,
      roleId,
      roleName: role.name,
      status: "in_progress",
      currentQuestionNumber: 0,
      responses: JSON.stringify([]),
    });

    await assessmentRepo.save(assessment);

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        roleId: assessment.roleId,
        roleName: assessment.roleName,
        status: assessment.status,
        currentQuestionNumber: assessment.currentQuestionNumber,
        responses: [],
      },
      message: "Assessment started",
    });
  } catch (error: any) {
    console.error("Error starting assessment:", error);
    return NextResponse.json(
      { error: "Failed to start assessment", message: error.message },
      { status: 500 }
    );
  }
}

// Get assessment
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const roleId = searchParams.get("roleId");
    const assessmentId = searchParams.get("id");

    const assessmentRepo = await getRepository(CareerAssessmentEntity);

    if (assessmentId) {
      // Get specific assessment by ID
      const assessment = await assessmentRepo.findOne({
        where: { id: assessmentId },
      });

      if (!assessment) {
        return NextResponse.json(
          { error: "Assessment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        assessment: {
          id: assessment.id,
          userId: assessment.userId,
          roleId: assessment.roleId,
          roleName: assessment.roleName,
          status: assessment.status,
          currentQuestionNumber: assessment.currentQuestionNumber,
          responses: assessment.responses
            ? JSON.parse(assessment.responses)
            : [],
          verdict: assessment.verdictTier
            ? {
                tier: assessment.verdictTier,
                score: assessment.verdictScore,
                timeline: assessment.verdictTimeline,
                strengths: assessment.strengths
                  ? JSON.parse(assessment.strengths)
                  : [],
                gaps: assessment.gaps ? JSON.parse(assessment.gaps) : [],
                recommendations: assessment.recommendations
                  ? JSON.parse(assessment.recommendations)
                  : [],
              }
            : null,
          fullAnalysis: assessment.fullAnalysis,
          startedAt: assessment.startedAt,
          completedAt: assessment.completedAt,
        },
      });
    } else if (userId && roleId) {
      // Get user's assessment for role
      const assessment = await assessmentRepo.findOne({
        where: { userId, roleId },
        order: { startedAt: "DESC" },
      });

      if (!assessment) {
        return NextResponse.json(
          { error: "No assessment found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        assessment: {
          id: assessment.id,
          roleId: assessment.roleId,
          roleName: assessment.roleName,
          status: assessment.status,
          currentQuestionNumber: assessment.currentQuestionNumber,
          responses: assessment.responses
            ? JSON.parse(assessment.responses)
            : [],
        },
      });
    } else {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error getting assessment:", error);
    return NextResponse.json(
      { error: "Failed to get assessment", message: error.message },
      { status: 500 }
    );
  }
}
