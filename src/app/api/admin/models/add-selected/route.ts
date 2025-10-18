import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getRepository } from "@/lib/data-source";
import { AIModelConfigEntity } from "@/entities/AIModelConfigEntity";
import { createAuditLog } from "@/lib/audit-service";
import { AuditAction } from "@/entities/AuditLogEntity";

/**
 * API route to add selected models from OpenRouter
 *
 * Usage:
 * POST /api/admin/models/add-selected
 * Body: { models: Array<{ id, name, description, pricing, context_length }> }
 *
 * SECURITY: Admin-only endpoint
 */
export async function POST(req: NextRequest) {
  // Require admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    if (!body.models || !Array.isArray(body.models)) {
      return NextResponse.json(
        { error: "Missing or invalid models array" },
        { status: 400 }
      );
    }

    const modelRepo = await getRepository(AIModelConfigEntity);

    let createdCount = 0;
    let skippedCount = 0;
    const createdModels: any[] = [];
    const errors: any[] = [];

    for (const selectedModel of body.models) {
      try {
        // Check if model already exists
        const existing = await modelRepo.findOne({
          where: { modelId: selectedModel.id },
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        // Extract provider from model ID (format: "provider/model-name")
        const provider = selectedModel.id.split("/")[0] || "unknown";

        // Calculate cost per 1k tokens (OpenRouter pricing is per token, we need per 1k tokens)
        const costPer1kInputTokens = selectedModel.pricing.prompt * 1000;
        const costPer1kOutputTokens = selectedModel.pricing.completion * 1000;

        // Check if this should be the first/default model
        const modelCount = await modelRepo.count();
        const isFirstModel = modelCount === 0;

        // Create new model
        const model = modelRepo.create({
          modelId: selectedModel.id,
          provider: provider,
          displayName: selectedModel.name,
          description: selectedModel.description,
          isEnabled: true,
          isDefault: isFirstModel, // First model added becomes default
          costPer1kInputTokens: costPer1kInputTokens,
          costPer1kOutputTokens: costPer1kOutputTokens,
          maxTokens: selectedModel.context_length || 8192,
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
      } catch (err: any) {
        errors.push({
          modelId: selectedModel.id,
          error: err.message,
        });
      }
    }

    // Log audit event
    if (createdCount > 0) {
      await createAuditLog({
        action: AuditAction.MODEL_CREATE,
        performedById: user!.id,
        description: `Added ${createdCount} AI model(s) from OpenRouter`,
        metadata: {
          createdCount,
          skippedCount,
          errorCount: errors.length,
          models: createdModels.map((m) => m.modelId),
        },
        resourceType: "ai_model",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${createdCount} model(s)`,
      summary: {
        created: createdCount,
        skipped: skippedCount,
        errors: errors.length,
      },
      models: createdModels,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error adding selected models:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add selected models",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
