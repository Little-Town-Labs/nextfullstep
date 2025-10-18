import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createAPIKey,
  getUserAPIKeys,
} from "@/lib/api-key-service";
import { getCurrentUser } from "@/lib/admin-guard";

/**
 * API Keys Management
 *
 * GET /api/api-keys - Get current user's API keys
 * POST /api/api-keys - Create new API key
 */

// GET: List user's API keys
export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const apiKeys = await getUserAPIKeys(user.id);

    // Don't expose the key hash or full details
    const sanitizedKeys = apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      description: key.description,
      permissions: key.permissions,
      isActive: key.isActive,
      rateLimit: key.rateLimit,
      lastUsedAt: key.lastUsedAt,
      lastUsedIpAddress: key.lastUsedIpAddress,
      usageCount: key.usageCount,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      revokedAt: key.revokedAt,
      revokedReason: key.revokedReason,
    }));

    return NextResponse.json({
      success: true,
      apiKeys: sanitizedKeys,
    });
  } catch (error: any) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST: Create new API key
export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, permissions, expiresInDays, rateLimit } = body;

    if (!name) {
      return NextResponse.json(
        { error: "API key name is required" },
        { status: 400 }
      );
    }

    // Validate permissions format
    if (permissions && !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Permissions must be an array" },
        { status: 400 }
      );
    }

    // Create API key
    const { apiKey, plainKey } = await createAPIKey({
      userId: user.id,
      name,
      description,
      permissions,
      expiresInDays: expiresInDays || 365, // Default 1 year
      rateLimit: rateLimit || {
        requestsPerMinute: 60,
        requestsPerDay: 10000,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "API key created successfully. Save it now - you won't be able to see it again!",
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        description: apiKey.description,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        rateLimit: apiKey.rateLimit,
      },
      key: plainKey, // Only returned once!
    });
  } catch (error: any) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
