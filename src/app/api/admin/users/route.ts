import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getRepository } from "@/lib/data-source";
import { UserEntity } from "@/entities/UserEntity";
import { Like } from "typeorm";

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

    // Update fields
    if (isAdmin !== undefined) {
      targetUser.isAdmin = isAdmin;
      targetUser.role = isAdmin ? "admin" : "user";
    }

    if (role !== undefined && ["user", "admin"].includes(role)) {
      targetUser.role = role;
      targetUser.isAdmin = role === "admin";
    }

    if (status !== undefined) {
      targetUser.status = status;
    }

    await userRepo.save(targetUser);

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
