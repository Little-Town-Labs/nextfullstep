import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  getAllModels,
  createModel,
  clearModelCache,
} from "@/lib/ai-model-service";
import { AIModelConfigEntity } from "@/entities/AIModelConfigEntity";

/**
 * Admin AI Models API
 *
 * GET /api/admin/models - List all AI models
 * POST /api/admin/models - Create a new AI model
 */

// GET: List all AI models
export async function GET(req: NextRequest) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const models = await getAllModels();

    return NextResponse.json({
      success: true,
      models: models.map((model) => ({
        id: model.id,
        modelId: model.modelId,
        provider: model.provider,
        displayName: model.displayName,
        description: model.description,
        isEnabled: model.isEnabled,
        isDefault: model.isDefault,
        costPer1kInputTokens: model.costPer1kInputTokens,
        costPer1kOutputTokens: model.costPer1kOutputTokens,
        maxTokens: model.maxTokens,
        temperature: model.temperature,
        maxOutputTokens: model.maxOutputTokens,
        capabilities: model.capabilities,
        status: model.status,
        usageCount: model.usageCount,
        lastUsedAt: model.lastUsedAt,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching AI models:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI models" },
      { status: 500 }
    );
  }
}

// POST: Create a new AI model
export async function POST(req: NextRequest) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.modelId || !body.provider || !body.displayName) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["modelId", "provider", "displayName"],
        },
        { status: 400 }
      );
    }

    // Create model
    const modelData: Partial<AIModelConfigEntity> = {
      modelId: body.modelId,
      provider: body.provider,
      displayName: body.displayName,
      description: body.description,
      isEnabled: body.isEnabled !== undefined ? body.isEnabled : true,
      isDefault: body.isDefault !== undefined ? body.isDefault : false,
      costPer1kInputTokens: body.costPer1kInputTokens,
      costPer1kOutputTokens: body.costPer1kOutputTokens,
      maxTokens: body.maxTokens,
      temperature: body.temperature !== undefined ? body.temperature : 0.7,
      maxOutputTokens: body.maxOutputTokens !== undefined ? body.maxOutputTokens : 3000,
      capabilities: body.capabilities,
      status: body.status || "active",
    };

    const model = await createModel(modelData);

    return NextResponse.json({
      success: true,
      message: "AI model created successfully",
      model: {
        id: model.id,
        modelId: model.modelId,
        provider: model.provider,
        displayName: model.displayName,
        isEnabled: model.isEnabled,
        isDefault: model.isDefault,
      },
    });
  } catch (error: any) {
    console.error("Error creating AI model:", error);
    return NextResponse.json(
      { error: "Failed to create AI model" },
      { status: 500 }
    );
  }
}
