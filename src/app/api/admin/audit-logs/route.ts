import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getAuditLogs, getAuditLogStats } from "@/lib/audit-service";
import { AuditAction, AuditSeverity } from "@/entities/AuditLogEntity";

/**
 * Admin Audit Logs API
 *
 * GET /api/admin/audit-logs - List audit logs with filters
 * GET /api/admin/audit-logs?stats=true - Get audit log statistics
 */

export async function GET(req: NextRequest) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);

    // Check if stats are requested
    if (searchParams.get("stats") === "true") {
      const startDate = searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined;
      const endDate = searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined;

      const stats = await getAuditLogStats(startDate, endDate);

      return NextResponse.json({
        success: true,
        stats,
      });
    }

    // Otherwise, return paginated logs
    const filters = {
      action: searchParams.get("action") as AuditAction | undefined,
      performedById: searchParams.get("performedById") || undefined,
      targetUserId: searchParams.get("targetUserId") || undefined,
      severity: searchParams.get("severity") as AuditSeverity | undefined,
      resourceType: searchParams.get("resourceType") || undefined,
      resourceId: searchParams.get("resourceId") || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
    };

    const result = await getAuditLogs(filters);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
