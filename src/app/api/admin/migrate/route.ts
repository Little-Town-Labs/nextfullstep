import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getDataSource } from "@/lib/data-source";

/**
 * Admin endpoint to run pending database migrations
 *
 * GET /api/admin/migrate - Run all pending migrations
 *
 * SECURITY: Admin-only endpoint
 */
export async function GET() {
  // Require admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const dataSource = await getDataSource();

    // Check if migrations are needed
    const pendingMigrations = await dataSource.showMigrations();

    if (!pendingMigrations) {
      return NextResponse.json({
        success: true,
        message: "No pending migrations",
        migrations: [],
      });
    }

    // Run pending migrations
    const migrations = await dataSource.runMigrations();

    return NextResponse.json({
      success: true,
      message: `Successfully ran ${migrations.length} migration(s)`,
      migrations: migrations.map(m => ({
        name: m.name,
        timestamp: m.timestamp,
      })),
    });
  } catch (err: any) {
    console.error("Migration error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run migrations",
        message: err.message,
        details: err.toString(),
      },
      { status: 500 }
    );
  }
}
