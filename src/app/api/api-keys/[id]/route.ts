import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAPIKeyById, revokeAPIKey } from "@/lib/api-key-service";
import { getCurrentUser } from "@/lib/admin-guard";

/**
 * API Key by ID
 *
 * GET /api/api-keys/[id] - Get specific API key
 * DELETE /api/api-keys/[id] - Revoke API key
 */

// GET: Get specific API key
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = params;
    const apiKey = await getAPIKeyById(id);

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Check ownership (admins can see all keys)
    if (apiKey.userId !== user.id && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        description: apiKey.description,
        permissions: apiKey.permissions,
        isActive: apiKey.isActive,
        rateLimit: apiKey.rateLimit,
        lastUsedAt: apiKey.lastUsedAt,
        lastUsedIpAddress: apiKey.lastUsedIpAddress,
        usageCount: apiKey.usageCount,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
        revokedAt: apiKey.revokedAt,
        revokedReason: apiKey.revokedReason,
        user: user.isAdmin
          ? {
              id: apiKey.user.id,
              email: apiKey.user.email,
              name: apiKey.user.name,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    console.error("Error fetching API key:", error);
    return NextResponse.json(
      { error: "Failed to fetch API key" },
      { status: 500 }
    );
  }
}

// DELETE: Revoke API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = params;
    const apiKey = await getAPIKeyById(id);

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Check ownership (admins can revoke any key)
    if (apiKey.userId !== user.id && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reason = searchParams.get("reason") || "User requested revocation";

    const success = await revokeAPIKey(id, user.id, reason);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to revoke API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    });
  } catch (error: any) {
    console.error("Error revoking API key:", error);
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}
