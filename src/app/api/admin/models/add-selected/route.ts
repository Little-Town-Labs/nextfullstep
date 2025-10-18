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
    console.log("Received request to add models:", {
      modelCount: body.models?.length,
      firstModel: body.models?.[0],
    });

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
        console.log(`Successfully created model: ${model.modelId}`);
      } catch (err: any) {
        console.error(`Error creating model ${selectedModel.id}:`, err);
        errors.push({
          modelId: selectedModel.id,
          error: err.message,
          stack: err.stack,
        });
      }
    }

    // Log audit event (non-blocking, don't fail if audit log fails)
    if (createdCount > 0) {
      try {
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
      } catch (auditError: any) {
        console.error("Failed to create audit log:", auditError);
        // Continue anyway - audit log failure shouldn't block the operation
      }
    }

    console.log("Final summary:", {
      created: createdCount,
      skipped: skippedCount,
      errors: errors.length,
    });

    // If all models failed, return 500
    if (createdCount === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to add any models",
          message: `All ${errors.length} model(s) failed to be added`,
          summary: {
            created: 0,
            skipped: skippedCount,
            errors: errors.length,
          },
          errors: errors,
        },
        { status: 500 }
      );
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
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add selected models",
        message: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
