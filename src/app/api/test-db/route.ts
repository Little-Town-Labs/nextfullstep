import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/data-source";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * API route to test NeonDB connection
 *
 * GET /api/test-db - Tests database connection and returns status
 *
 * SECURITY: Admin-only endpoint - exposes database information
 */
export async function GET(req: NextRequest) {
  // Require admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const dataSource = await initializeDatabase();

    // Test query to verify connection
    const result = await dataSource.query("SELECT NOW() as current_time, version() as pg_version");

    return NextResponse.json({
      success: true,
      message: "✅ Connected to NeonDB successfully",
      connection: {
        type: "postgres",
        isConnected: dataSource.isInitialized,
      },
      server: {
        currentTime: result[0].current_time,
        postgresVersion: result[0].pg_version,
      },
    });
  } catch (error: any) {
    console.error("❌ Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to NeonDB",
        message: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
