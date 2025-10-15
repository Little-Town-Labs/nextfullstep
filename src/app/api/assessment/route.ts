import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRepository } from "@/lib/data-source";
import { CareerAssessmentEntity } from "@/entities/CareerAssessmentEntity";
import { CareerRoleEntity } from "@/entities/CareerRoleEntity";
import { checkAssessmentLimit, incrementAssessmentUsage } from "@/lib/subscription";

/**
 * Assessment API Routes
 *
 * POST /api/assessment - Start new assessment (Clerk auth required)
 * GET /api/assessment?id=X - Get assessment by ID (Clerk auth required)
 */

// Start new assessment
export async function POST(req: NextRequest) {
  try {
    // Authenticate with Clerk
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { roleId } = await req.json();

    if (!roleId) {
      return NextResponse.json(
        { error: "Missing roleId" },
        { status: 400 }
      );
    }

    // Check assessment limit based on subscription tier
    const limitCheck = await checkAssessmentLimit(clerkUserId);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Assessment limit reached",
          message: `You've reached your assessment limit (${limitCheck.current}/${limitCheck.limit}). Upgrade to Pro for unlimited assessments.`,
          current: limitCheck.current,
          limit: limitCheck.limit,
          tier: limitCheck.tier,
          upgradeRequired: true
        },
        { status: 403 }
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
      where: { userId: clerkUserId, roleId, status: "in_progress" },
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
      userId: clerkUserId,
      roleId,
      roleName: role.name,
      status: "in_progress",
      currentQuestionNumber: 0,
      responses: JSON.stringify([]),
    });

    await assessmentRepo.save(assessment);

    // Increment usage count for free tier users
    if (limitCheck.tier === 'free') {
      await incrementAssessmentUsage(clerkUserId);
    }

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
      usage: {
        current: limitCheck.current + 1,
        limit: limitCheck.limit,
        tier: limitCheck.tier,
      }
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
    // Authenticate with Clerk
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
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

      // Verify the assessment belongs to the authenticated user
      if (assessment.userId !== clerkUserId) {
        return NextResponse.json(
          { error: "Forbidden - You don't have access to this assessment" },
          { status: 403 }
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
    } else {
      return NextResponse.json(
        { error: "Missing assessment ID parameter" },
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
