import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * API route to browse available models from OpenRouter
 *
 * Usage:
 * GET /api/admin/models/browse - Fetches all available models from OpenRouter API
 *
 * SECURITY: Admin-only endpoint
 */
export async function GET(req: NextRequest) {
  // Require admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    // Fetch models from OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform the data to a more usable format
    const models = data.data.map((model: any) => ({
      id: model.id,
      name: model.name,
      description: model.description,
      pricing: {
        prompt: parseFloat(model.pricing?.prompt || "0"),
        completion: parseFloat(model.pricing?.completion || "0"),
        request: parseFloat(model.pricing?.request || "0"),
        image: parseFloat(model.pricing?.image || "0"),
      },
      context_length: model.context_length,
      architecture: model.architecture,
      top_provider: model.top_provider,
      per_request_limits: model.per_request_limits,
    }));

    // Sort by provider and name for better organization
    models.sort((a: any, b: any) => {
      const providerA = a.id.split("/")[0];
      const providerB = b.id.split("/")[0];
      if (providerA !== providerB) {
        return providerA.localeCompare(providerB);
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      count: models.length,
      models,
    });
  } catch (error: any) {
    console.error("Error fetching OpenRouter models:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch models from OpenRouter",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
