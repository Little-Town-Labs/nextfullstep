import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getDefaultModel, setDefaultModel } from "@/lib/ai-model-service";

/**
 * Admin Default Model API
 *
 * GET /api/admin/models/default - Get current default model
 * PUT /api/admin/models/default - Set default model
 */

// GET: Get current default model
export async function GET(req: NextRequest) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const defaultModel = await getDefaultModel();

    if (!defaultModel) {
      return NextResponse.json(
        { error: "No default model configured" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      model: defaultModel,
    });
  } catch (error: any) {
    console.error("Error fetching default model:", error);
    return NextResponse.json(
      { error: "Failed to fetch default model" },
      { status: 500 }
    );
  }
}

// PUT: Set default model
export async function PUT(req: NextRequest) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const { modelId } = await req.json();

    if (!modelId) {
      return NextResponse.json(
        { error: "Missing modelId in request body" },
        { status: 400 }
      );
    }

    const success = await setDefaultModel(modelId);

    if (!success) {
      return NextResponse.json(
        { error: "Model not found or failed to update" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Default model updated successfully",
    });
  } catch (error: any) {
    console.error("Error setting default model:", error);
    return NextResponse.json(
      { error: "Failed to set default model" },
      { status: 500 }
    );
  }
}
