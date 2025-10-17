import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRepository } from "./data-source";
import { UserEntity } from "@/entities/UserEntity";

/**
 * Admin Guard Utility
 * Checks if the current user has admin privileges
 */

/**
 * Check if user is an admin
 * Returns user entity if admin, null if not
 */
export async function checkIsAdmin(): Promise<UserEntity | null> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  try {
    const userRepo = await getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { clerkUserId, isAdmin: true },
    });

    return user as UserEntity | null;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return null;
  }
}

/**
 * Require admin access for API routes
 * Returns NextResponse with 401/403 error if not authorized
 * Returns user entity if authorized
 */
export async function requireAdmin(): Promise<
  { user: UserEntity; error: null } | { user: null; error: NextResponse }
> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      ),
    };
  }

  try {
    const userRepo = await getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { clerkUserId } });

    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        ),
      };
    }

    if (!user.isAdmin) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        ),
      };
    }

    return { user: user as UserEntity, error: null };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return {
      user: null,
      error: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Get current user (admin or not)
 * Returns user entity if logged in, null if not
 */
export async function getCurrentUser(): Promise<UserEntity | null> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  try {
    const userRepo = await getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { clerkUserId } });
    return user as UserEntity | null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
