import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/data-source";
import { CareerRoleEntity } from "@/entities/CareerRoleEntity";


/**
 * API route for career roles
 *
 * GET /api/careers - Fetch all active career roles
 * GET /api/careers?id=ai-prompt-engineer - Fetch specific role by ID
 */
export async function GET(req: NextRequest) {
  try {
    const roleRepo = await getRepository(CareerRoleEntity);
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("id");

    if (roleId) {
      // Fetch specific role
      const role = await roleRepo.findOne({
        where: { id: roleId, isActive: true },
      });

      if (!role) {
        return NextResponse.json(
          { error: "Career role not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        role: {
          id: role.id,
          name: role.name,
          shortDescription: role.shortDescription,
          category: role.category,
          accessibilityLevel: role.accessibilityLevel,
          typicalTimeline: role.typicalTimeline,
          avgStartingSalary: role.avgStartingSalary,
          freelanceRate: role.freelanceRate,
          growthRate: role.growthRate,
          remoteOpportunity: role.remoteOpportunity,
          // Don't send system prompt to client (too large, only needed server-side)
        },
      });
    } else {
      // Fetch all active roles
      const roles = await roleRepo.find({
        where: { isActive: true },
        order: { sortOrder: "ASC" },
      });

      return NextResponse.json({
        success: true,
        count: roles.length,
        roles: roles.map((role) => ({
          id: role.id,
          name: role.name,
          shortDescription: role.shortDescription,
          category: role.category,
          accessibilityLevel: role.accessibilityLevel,
          typicalTimeline: role.typicalTimeline,
          avgStartingSalary: role.avgStartingSalary,
          freelanceRate: role.freelanceRate,
          growthRate: role.growthRate,
          remoteOpportunity: role.remoteOpportunity,
        })),
      });
    }
  } catch (error: any) {
    console.error("Error fetching career roles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch career roles",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
