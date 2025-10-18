import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getRepository } from "@/lib/data-source";
import { AIModelConfigEntity } from "@/entities/AIModelConfigEntity";
import { PREDEFINED_MODELS } from "@/lib/ai-config";
import { createAuditLog } from "@/lib/audit-service";
import { AuditAction } from "@/entities/AuditLogEntity";

/**
 * API route to seed AI models into the database
 *
 * Usage:
 * POST /api/admin/models/seed - Seeds predefined AI models from OpenRouter
 *
 * SECURITY: Admin-only endpoint
 * This is safe to call multiple times - it will skip existing models
 */
export async function POST(req: NextRequest) {
  // Require admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const modelRepo = await getRepository(AIModelConfigEntity);

    // Check if models already exist
    const existingCount = await modelRepo.count();

    // Seed each predefined model
    let createdCount = 0;
    let skippedCount = 0;
    const createdModels: any[] = [];

    for (const [modelId, config] of Object.entries(PREDEFINED_MODELS)) {
      // Check if model already exists
      const existing = await modelRepo.findOne({ where: { modelId } });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Create new model
      const model = modelRepo.create({
        modelId,
        provider: config.provider,
        displayName: config.displayName,
        description: config.description,
        isEnabled: true,
        isDefault: modelId === "openai/gpt-4o-mini", // Set GPT-4o Mini as default
        costPer1kInputTokens: config.costPer1kInputTokens,
        costPer1kOutputTokens: config.costPer1kOutputTokens,
        maxTokens: config.maxTokens,
        temperature: 0.7,
        maxOutputTokens: 3000,
        capabilities: {
          assessments: true,
          coaching: true,
          streaming: false,
          functionCalling: false,
        },
        status: "active",
        usageCount: 0,
      });

      await modelRepo.save(model);
      createdCount++;
      createdModels.push({
        id: model.id,
        modelId: model.modelId,
        displayName: model.displayName,
        provider: model.provider,
      });
    }

    // Get the default model
    const defaultModel = await modelRepo.findOne({
      where: { isDefault: true },
    });

    // Log audit event
    if (createdCount > 0) {
      await createAuditLog({
        action: AuditAction.MODEL_CREATE,
        performedById: user!.id,
        description: `Seeded ${createdCount} AI model(s)`,
        metadata: {
          createdCount,
          skippedCount,
          models: createdModels.map((m) => m.modelId),
        },
        resourceType: "ai_model",
      });
    }

    return NextResponse.json({
      success: true,
      message: "AI models seeded successfully",
      summary: {
        created: createdCount,
        skipped: skippedCount,
        existingBefore: existingCount,
        totalNow: await modelRepo.count(),
        defaultModel: defaultModel
          ? {
              id: defaultModel.id,
              modelId: defaultModel.modelId,
              displayName: defaultModel.displayName,
            }
          : null,
      },
      models: createdModels,
    });
  } catch (error: any) {
    console.error("Error seeding AI models:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed AI models",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
