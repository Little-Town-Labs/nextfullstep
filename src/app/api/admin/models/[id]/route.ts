import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  getModelById,
  updateModel,
  deleteModel,
  toggleModelEnabled,
} from "@/lib/ai-model-service";
import { createAuditLog } from "@/lib/audit-service";
import { AuditAction } from "@/entities/AuditLogEntity";

/**
 * Admin AI Model by ID API
 *
 * GET /api/admin/models/[id] - Get specific model
 * PUT /api/admin/models/[id] - Update model
 * PATCH /api/admin/models/[id] - Toggle enabled state
 * DELETE /api/admin/models/[id] - Delete model
 */

// GET: Get specific model
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = params;
    const model = await getModelById(id);

    if (!model) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      model,
    });
  } catch (error: any) {
    console.error("Error fetching model:", error);
    return NextResponse.json(
      { error: "Failed to fetch model" },
      { status: 500 }
    );
  }
}

// PUT: Update model
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = params;
    const body = await req.json();

    // Validate model exists
    const existingModel = await getModelById(id);
    if (!existingModel) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      );
    }

    // Update model
    const updatedModel = await updateModel(id, body);

    if (!updatedModel) {
      return NextResponse.json(
        { error: "Failed to update model" },
        { status: 500 }
      );
    }

    // Log audit event
    await createAuditLog({
      action: AuditAction.MODEL_UPDATE,
      performedById: user!.id,
      description: `Updated AI model: ${updatedModel.displayName} (${updatedModel.modelId})`,
      metadata: {
        modelId: updatedModel.id,
        changes: body,
        provider: updatedModel.provider,
        displayName: updatedModel.displayName,
      },
      resourceType: "ai_model",
      resourceId: updatedModel.id,
    });

    return NextResponse.json({
      success: true,
      message: "Model updated successfully",
      model: updatedModel,
    });
  } catch (error: any) {
    console.error("Error updating model:", error);
    return NextResponse.json(
      { error: "Failed to update model" },
      { status: 500 }
    );
  }
}

// PATCH: Toggle model enabled state
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = params;

    const updatedModel = await toggleModelEnabled(id);

    if (!updatedModel) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Model ${updatedModel.isEnabled ? 'enabled' : 'disabled'} successfully`,
      model: updatedModel,
    });
  } catch (error: any) {
    console.error("Error toggling model:", error);
    return NextResponse.json(
      { error: "Failed to toggle model" },
      { status: 500 }
    );
  }
}

// DELETE: Delete model
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = params;

    // Validate model exists
    const existingModel = await getModelById(id);
    if (!existingModel) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      );
    }

    // Prevent deleting the default model
    if (existingModel.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete the default model. Set another model as default first." },
        { status: 400 }
      );
    }

    const deleted = await deleteModel(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete model" },
        { status: 500 }
      );
    }

    // Log audit event
    await createAuditLog({
      action: AuditAction.MODEL_DELETE,
      performedById: user!.id,
      description: `Deleted AI model: ${existingModel.displayName} (${existingModel.modelId})`,
      metadata: {
        modelId: existingModel.id,
        provider: existingModel.provider,
        displayName: existingModel.displayName,
        modelId_original: existingModel.modelId,
      },
      resourceType: "ai_model",
      resourceId: id,
    });

    return NextResponse.json({
      success: true,
      message: "Model deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting model:", error);
    return NextResponse.json(
      { error: "Failed to delete model" },
      { status: 500 }
    );
  }
}
