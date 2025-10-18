import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { get2FAStatus } from "@/lib/admin-2fa-guard";
import { getRepository } from "@/lib/data-source";
import { UserEntity } from "@/entities/UserEntity";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Admin 2FA Status API
 *
 * GET /api/admin/2fa-status - Get 2FA status for current admin
 * GET /api/admin/2fa-status?userId=xxx - Get 2FA status for specific user (admin only)
 */

export async function GET(req: NextRequest) {
  // Check admin access
  const { user: adminUser, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    // If checking another user's 2FA status
    if (targetUserId) {
      const userRepo = await getRepository(UserEntity);
      const targetUser = await userRepo.findOne({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const status = await get2FAStatus(targetUser.clerkUserId);

      return NextResponse.json({
        success: true,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name,
          isAdmin: targetUser.isAdmin,
        },
        twoFactorAuth: status,
      });
    }

    // Check current admin's 2FA status
    const status = await get2FAStatus(adminUser!.clerkUserId);

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser!.id,
        email: adminUser!.email,
        name: adminUser!.name,
        isAdmin: adminUser!.isAdmin,
      },
      twoFactorAuth: status,
    });
  } catch (error: any) {
    console.error("Error fetching 2FA status:", error);
    return NextResponse.json(
      { error: "Failed to fetch 2FA status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/2fa-status/bulk - Get 2FA status for multiple users
 */
export async function POST(req: NextRequest) {
  // Check admin access
  const { user: adminUser, error } = await requireAdmin();
  if (error) return error;

  try {
    const { userIds } = await req.json();

    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "userIds must be an array" },
        { status: 400 }
      );
    }

    const userRepo = await getRepository(UserEntity);
    const users = await userRepo
      .createQueryBuilder("user")
      .whereInIds(userIds)
      .getMany();

    const results = await Promise.all(
      users.map(async (user) => {
        const status = await get2FAStatus(user.clerkUserId);
        return {
          userId: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          twoFactorAuth: status,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: results,
    });
  } catch (error: any) {
    console.error("Error fetching bulk 2FA status:", error);
    return NextResponse.json(
      { error: "Failed to fetch 2FA status" },
      { status: 500 }
    );
  }
}
