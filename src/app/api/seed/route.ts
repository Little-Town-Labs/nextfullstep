import { NextRequest, NextResponse } from "next/server";
import { seedCareerRoles } from "@/lib/seed-career-roles";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * API route to seed the database with MVP career roles
 *
 * Usage:
 * GET /api/seed - Seeds the 3 MVP career roles into the database
 *
 * SECURITY: Admin-only endpoint
 * This is safe to call multiple times - it will update existing roles
 * rather than creating duplicates
 */
export async function GET(req: NextRequest) {
  // Require admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    await seedCareerRoles();

    return NextResponse.json({
      success: true,
      message: "Career roles seeded successfully",
      roles: [
        { id: "ai-prompt-engineer", name: "AI Prompt Engineer" },
        { id: "ai-content-creator", name: "AI Content Creator" },
        { id: "ai-coach", name: "AI Coach" },
      ],
    });
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed career roles",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
