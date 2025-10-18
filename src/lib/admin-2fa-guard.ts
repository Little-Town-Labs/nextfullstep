import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRepository } from "./data-source";
import { UserEntity } from "@/entities/UserEntity";
import { logSecurityEvent } from "./audit-service";
import { AuditAction, AuditSeverity } from "@/entities/AuditLogEntity";

/**
 * Admin 2FA Guard
 * Ensures admin users have 2FA enabled before accessing admin routes
 */

interface Admin2FACheckResult {
  user: UserEntity | null;
  has2FA: boolean;
  error: NextResponse | null;
}

/**
 * Checks if the current admin user has 2FA enabled
 * Returns user if 2FA is enabled, otherwise returns an error response
 */
export async function requireAdmin2FA(): Promise<Admin2FACheckResult> {
  // Get authenticated user
  const { userId } = await auth();

  if (!userId) {
    return {
      user: null,
      has2FA: false,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Get user from database
  const userRepo = await getRepository(UserEntity);
  const user = await userRepo.findOne({
    where: { clerkUserId: userId },
  }) as UserEntity | null;

  if (!user) {
    return {
      user: null,
      has2FA: false,
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  // Check if user is admin
  if (!user.isAdmin) {
    await logSecurityEvent({
      action: AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
      userId: user.id,
      description: `Non-admin user ${user.email} attempted to access admin route`,
      severity: AuditSeverity.WARNING,
      metadata: {
        userId: user.id,
        email: user.email,
        attemptedRoute: "admin",
      },
    });

    return {
      user: null,
      has2FA: false,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  // Check if user has 2FA enabled via Clerk
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  const has2FA =
    clerkUser.twoFactorEnabled ||
    (clerkUser.totpEnabled ?? false) ||
    (clerkUser.backupCodeEnabled ?? false);

  if (!has2FA) {
    await logSecurityEvent({
      action: AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
      userId: user.id,
      description: `Admin user ${user.email} attempted to access admin route without 2FA enabled`,
      severity: AuditSeverity.CRITICAL,
      metadata: {
        userId: user.id,
        email: user.email,
        reason: "2FA not enabled",
      },
    });

    return {
      user,
      has2FA: false,
      error: NextResponse.json(
        {
          error: "2FA Required",
          message:
            "Two-factor authentication is required for admin accounts. Please enable 2FA in your account settings.",
          redirectUrl: "/user-profile", // Clerk user profile page
        },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    has2FA: true,
    error: null,
  };
}

/**
 * Checks if a user has 2FA enabled (without requiring admin status)
 */
export async function check2FAEnabled(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    return (
      clerkUser.twoFactorEnabled ||
      (clerkUser.totpEnabled ?? false) ||
      (clerkUser.backupCodeEnabled ?? false)
    );
  } catch (error) {
    console.error("Error checking 2FA status:", error);
    return false;
  }
}

/**
 * Get 2FA status for a user
 */
export async function get2FAStatus(userId: string): Promise<{
  enabled: boolean;
  methods: string[];
}> {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    const methods: string[] = [];

    if (clerkUser.totpEnabled) {
      methods.push("totp");
    }
    if (clerkUser.backupCodeEnabled) {
      methods.push("backup_codes");
    }

    return {
      enabled: clerkUser.twoFactorEnabled || methods.length > 0,
      methods,
    };
  } catch (error) {
    console.error("Error getting 2FA status:", error);
    return {
      enabled: false,
      methods: [],
    };
  }
}
