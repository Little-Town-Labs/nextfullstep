import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getUsageStats, getAggregateUsageStats } from "@/lib/ai-model-service";

/**
 * Admin Usage Analytics API
 *
 * GET /api/admin/usage - Get AI usage statistics
 */

export async function GET(req: NextRequest) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const modelId = searchParams.get("modelId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");
    const aggregate = searchParams.get("aggregate") === "true";

    // Build options object
    const options: any = {};

    if (userId) options.userId = userId;
    if (modelId) options.modelId = modelId;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (limit) options.limit = parseInt(limit);

    // Get aggregate or detailed stats
    if (aggregate) {
      const stats = await getAggregateUsageStats({
        startDate: options.startDate,
        endDate: options.endDate,
      });

      return NextResponse.json({
        success: true,
        stats: stats.map((s) => ({
          modelId: s.modelId,
          provider: s.provider,
          requestCount: parseInt(s.requestCount),
          totalTokens: parseInt(s.totalTokens) || 0,
          totalCost: parseFloat(s.totalCost) || 0,
          avgLatency: parseFloat(s.avgLatency) || 0,
        })),
      });
    } else {
      const logs = await getUsageStats(options);

      return NextResponse.json({
        success: true,
        logs: logs.map((log) => ({
          id: log.id,
          userId: log.userId,
          modelId: log.modelId,
          provider: log.provider,
          requestType: log.requestType,
          relatedEntityId: log.relatedEntityId,
          inputTokens: log.inputTokens,
          outputTokens: log.outputTokens,
          totalTokens: log.totalTokens,
          estimatedCost: log.estimatedCost,
          latencyMs: log.latencyMs,
          status: log.status,
          errorMessage: log.errorMessage,
          createdAt: log.createdAt,
        })),
        count: logs.length,
      });
    }
  } catch (error: any) {
    console.error("Error fetching usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}
