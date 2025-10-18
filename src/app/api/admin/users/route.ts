import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getRepository } from "@/lib/data-source";
import { UserEntity } from "@/entities/UserEntity";
import { Like } from "typeorm";
import { logAdminUserAction } from "@/lib/audit-service";
import { AuditAction } from "@/entities/AuditLogEntity";

/**
 * Admin Users API
 *
 * GET /api/admin/users - List all users with filters
 * PUT /api/admin/users - Update user (e.g., promote/demote admin)
 */

// GET: List all users
export async function GET(req: NextRequest) {
  // Check admin access
  const { user, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const userRepo = await getRepository(UserEntity);
    const queryBuilder = userRepo.createQueryBuilder("user");

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        "(user.email LIKE :search OR user.name LIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (role) {
      queryBuilder.andWhere("user.role = :role", { role });
    }

    if (status) {
      queryBuilder.andWhere("user.status = :status", { status });
    }

    // Get total count
    const totalCount = await queryBuilder.getCount();

    // Get paginated results
    const users = await queryBuilder
      .orderBy("user.createdAt", "DESC")
      .skip(offset)
      .take(limit)
      .getMany();

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        clerkUserId: u.clerkUserId,
        email: u.email,
        name: u.name,
        profileImageUrl: u.profileImageUrl,
        role: u.role,
        isAdmin: u.isAdmin,
        subscriptionTier: u.subscriptionTier,
        subscriptionStatus: u.subscriptionStatus,
        assessmentsUsed: u.assessmentsUsed,
        assessmentsLimit: u.assessmentsLimit,
        status: u.status,
        onboardingCompleted: u.onboardingCompleted,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT: Update user (e.g., promote/demote admin)
export async function PUT(req: NextRequest) {
  // Check admin access
  const { user: adminUser, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { userId, isAdmin, role, status } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in request body" },
        { status: 400 }
      );
    }

    const userRepo = await getRepository(UserEntity);
    const targetUser = await userRepo.findOne({ where: { id: userId } });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent demoting yourself
    if (targetUser.id === adminUser!.id && isAdmin === false) {
      return NextResponse.json(
        { error: "You cannot demote yourself" },
        { status: 400 }
      );
    }

    // Track changes for audit log
    const changes: string[] = [];
    const metadata: Record<string, any> = {};

    // Update fields
    if (isAdmin !== undefined && targetUser.isAdmin !== isAdmin) {
      const oldValue = targetUser.isAdmin;
      targetUser.isAdmin = isAdmin;
      targetUser.role = isAdmin ? "admin" : "user";
      changes.push(`isAdmin: ${oldValue} → ${isAdmin}`);
      metadata.isAdmin = { old: oldValue, new: isAdmin };
    }

    if (role !== undefined && ["user", "admin"].includes(role) && targetUser.role !== role) {
      const oldValue = targetUser.role;
      targetUser.role = role;
      targetUser.isAdmin = role === "admin";
      changes.push(`role: ${oldValue} → ${role}`);
      metadata.role = { old: oldValue, new: role };
    }

    if (status !== undefined && targetUser.status !== status) {
      const oldValue = targetUser.status;
      targetUser.status = status;
      changes.push(`status: ${oldValue} → ${status}`);
      metadata.status = { old: oldValue, new: status };
    }

    await userRepo.save(targetUser);

    // Log audit event if changes were made
    if (changes.length > 0) {
      // Determine the action type
      let action = AuditAction.USER_UPDATE;
      if (metadata.isAdmin) {
        action = metadata.isAdmin.new
          ? AuditAction.USER_PROMOTE_ADMIN
          : AuditAction.USER_DEMOTE_ADMIN;
      }

      await logAdminUserAction({
        action,
        adminId: adminUser!.id,
        targetUserId: targetUser.id,
        description: `Updated user ${targetUser.email}: ${changes.join(", ")}`,
        metadata: {
          changes: metadata,
          targetEmail: targetUser.email,
          targetName: targetUser.name,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        isAdmin: targetUser.isAdmin,
        status: targetUser.status,
      },
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
