import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/data-source";
import { CareerAssessmentEntity } from "@/entities/CareerAssessmentEntity";
import { CareerRoleEntity } from "@/entities/CareerRoleEntity";
import { RoadmapEntity } from "@/entities/RoadmapEntity";
import { RoadmapTaskEntity } from "@/entities/RoadmapTaskEntity";
import { analyzeCareerAssessment } from "@/app/actions";
import {
  parseRoadmapFromAnalysis,
  extractStrengthsFromAnalysis,
  extractGapsFromAnalysis,
} from "@/lib/parse-roadmap";

/**
 * Assessment Update & Complete API
 *
 * PUT /api/assessment/[id] - Save answer to question
 * POST /api/assessment/[id]/complete - Complete assessment and get analysis
 */

// Save answer to question
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { questionNumber, question, answer } = await req.json();

    if (questionNumber === undefined || !question || !answer) {
      return NextResponse.json(
        { error: "Missing questionNumber, question, or answer" },
        { status: 400 }
      );
    }

    const assessmentRepo = await getRepository(CareerAssessmentEntity);
    const assessment = await assessmentRepo.findOne({ where: { id } });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Parse existing responses
    const responses = assessment.responses
      ? JSON.parse(assessment.responses)
      : [];

    // Add or update response
    const existingIndex = responses.findIndex(
      (r: any) => r.questionNumber === questionNumber
    );

    const newResponse = {
      questionNumber,
      question,
      answer,
      timestamp: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      responses[existingIndex] = newResponse;
    } else {
      responses.push(newResponse);
    }

    // Update assessment
    assessment.responses = JSON.stringify(responses);
    assessment.currentQuestionNumber = questionNumber;

    await assessmentRepo.save(assessment);

    return NextResponse.json({
      success: true,
      message: "Answer saved",
      currentQuestionNumber: assessment.currentQuestionNumber,
      totalResponses: responses.length,
    });
  } catch (error: any) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer", message: error.message },
      { status: 500 }
    );
  }
}

// Complete assessment and get GPT analysis
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const assessmentRepo = await getRepository(CareerAssessmentEntity);
    const assessment = await assessmentRepo.findOne({ where: { id } });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status === "completed") {
      return NextResponse.json(
        { error: "Assessment already completed" },
        { status: 400 }
      );
    }

    // Get role's system prompt
    const roleRepo = await getRepository(CareerRoleEntity);
    const role = await roleRepo.findOne({
      where: { id: assessment.roleId },
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Parse responses
    const responses = assessment.responses
      ? JSON.parse(assessment.responses)
      : [];

    if (responses.length < 8) {
      const answeredQuestions = responses.map((r: any) => r.questionNumber).sort();
      const missingQuestions = [];
      for (let i = 1; i <= 8; i++) {
        if (!answeredQuestions.includes(i)) {
          missingQuestions.push(i);
        }
      }

      return NextResponse.json(
        {
          error: "Not all questions answered",
          message: `You've answered ${responses.length} out of 8 questions. Missing questions: ${missingQuestions.join(', ')}`,
          answeredQuestions,
          missingQuestions
        },
        { status: 400 }
      );
    }

    // Get GPT analysis
    console.log(`Analyzing assessment ${id} for role ${assessment.roleId}...`);
    console.log(`Number of responses: ${responses.length}`);

    let analysisText: string;
    try {
      analysisText = await analyzeCareerAssessment(
        assessment.roleId,
        role.systemPrompt,
        responses.map((r: any) => ({
          question: r.question,
          answer: r.answer,
        })),
        assessment.userId, // Pass userId for usage tracking
        assessment.id // Pass assessmentId for usage tracking
      );
      console.log(`AI analysis completed, length: ${analysisText.length} chars`);
    } catch (aiError: any) {
      console.error(`AI analysis failed:`, aiError);
      return NextResponse.json(
        {
          error: "Failed to complete assessment",
          message: `AI analysis error: ${aiError.message}`,
          details: aiError.toString()
        },
        { status: 500 }
      );
    }

    // Parse verdict from analysis (basic extraction)
    // Look for qualification tier in the text
    let verdictTier = "UNKNOWN";
    let verdictScore = 50;
    let verdictTimeline = "Unknown";

    if (analysisText.includes("QUALIFIED NOW") || analysisText.includes("✅")) {
      verdictTier = "QUALIFIED_NOW";
      verdictScore = 85;
      verdictTimeline = "0-1 months";
    } else if (
      analysisText.includes("NEARLY QUALIFIED") ||
      analysisText.includes("⚡")
    ) {
      verdictTier = "NEARLY_QUALIFIED";
      verdictScore = 65;
      verdictTimeline = "1-3 months";
    } else if (
      analysisText.includes("SIGNIFICANT GAPS") ||
      analysisText.includes("📚")
    ) {
      verdictTier = "SIGNIFICANT_GAPS";
      verdictScore = 40;
      verdictTimeline = "3-6 months";
    } else if (
      analysisText.includes("NOT CURRENTLY VIABLE") ||
      analysisText.includes("🔄")
    ) {
      verdictTier = "NOT_VIABLE";
      verdictScore = 20;
      verdictTimeline = "6-12 months";
    }

    // Extract structured data from GPT analysis
    const strengths = extractStrengthsFromAnalysis(analysisText);
    const gaps = extractGapsFromAnalysis(analysisText);
    const parsedRoadmap = parseRoadmapFromAnalysis(analysisText);

    // Update assessment with results
    assessment.status = "completed";
    assessment.completedAt = new Date();
    assessment.verdictTier = verdictTier;
    assessment.verdictScore = verdictScore;
    assessment.verdictTimeline = verdictTimeline;
    assessment.fullAnalysis = analysisText;
    assessment.strengths = JSON.stringify(strengths);
    assessment.gaps = JSON.stringify(gaps);
    assessment.recommendations = JSON.stringify(
      parsedRoadmap.phases.flatMap((p) => p.tasks.map((t) => t.title))
    );

    await assessmentRepo.save(assessment);

    console.log(`Assessment ${id} completed with verdict: ${verdictTier}`);

    // Create roadmap entity
    const roadmapRepo = await getRepository(RoadmapEntity);
    const roadmap = roadmapRepo.create({
      userId: assessment.userId,
      assessmentId: assessment.id,
      roleId: assessment.roleId,
      roleName: assessment.roleName,
      status: "active",
      phases: JSON.stringify(
        parsedRoadmap.phases.map((p) => ({
          phaseId: p.phaseId,
          phaseName: p.phaseName,
          taskCount: p.tasks.length,
        }))
      ),
      totalTasks: parsedRoadmap.totalTasks,
      completedTasks: 0,
      progressPercentage: 0,
      daysActive: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date(),
    });

    await roadmapRepo.save(roadmap);

    console.log(`Created roadmap ${roadmap.id} with ${parsedRoadmap.totalTasks} tasks`);

    // Create roadmap task entities
    const taskRepo = await getRepository(RoadmapTaskEntity);
    const taskEntities: RoadmapTaskEntity[] = [];

    for (const phase of parsedRoadmap.phases) {
      for (const task of phase.tasks) {
        const taskEntity = new RoadmapTaskEntity();
        taskEntity.roadmapId = roadmap.id;
        taskEntity.userId = assessment.userId;
        taskEntity.phaseId = phase.phaseId;
        taskEntity.phaseName = phase.phaseName;
        taskEntity.title = task.title;
        taskEntity.description = task.description;
        taskEntity.priority = task.priority;
        taskEntity.estimatedHours = task.estimatedHours;
        taskEntity.status = "pending";
        taskEntity.sortOrder = task.sortOrder;
        taskEntity.resources = task.resources ? JSON.stringify(task.resources) : undefined;
        taskEntities.push(taskEntity);
      }
    }

    await taskRepo.save(taskEntities);

    console.log(`Created ${taskEntities.length} roadmap tasks`);

    return NextResponse.json({
      success: true,
      message: "Assessment completed and roadmap generated",
      assessment: {
        id: assessment.id,
        status: assessment.status,
        verdict: {
          tier: verdictTier,
          score: verdictScore,
          timeline: verdictTimeline,
        },
        fullAnalysis: analysisText,
        completedAt: assessment.completedAt,
      },
      roadmap: {
        id: roadmap.id,
        totalTasks: roadmap.totalTasks,
        phases: parsedRoadmap.phases.length,
      },
    });
  } catch (error: any) {
    console.error("Error completing assessment:", error);
    return NextResponse.json(
      { error: "Failed to complete assessment", message: error.message },
      { status: 500 }
    );
  }
}
