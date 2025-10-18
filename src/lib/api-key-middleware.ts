import { NextRequest, NextResponse } from "next/server";
import { validateAPIKey, hasPermission } from "./api-key-service";
import { APIKeyEntity } from "@/entities/APIKeyEntity";
import { UserEntity } from "@/entities/UserEntity";

/**
 * API Key Authentication Middleware
 * Validates API keys from Authorization header
 */

export interface APIKeyAuthResult {
  authenticated: boolean;
  apiKey?: APIKeyEntity;
  user?: UserEntity;
  error?: NextResponse;
}

/**
 * Authenticates request using API key from Authorization header
 * Supports two formats:
 * - Authorization: Bearer nfs_xxxxx
 * - Authorization: ApiKey nfs_xxxxx
 */
export async function authenticateAPIKey(
  req: NextRequest
): Promise<APIKeyAuthResult> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return {
      authenticated: false,
      error: NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      ),
    };
  }

  // Extract API key from header
  let apiKeyString: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    apiKeyString = authHeader.substring(7);
  } else if (authHeader.startsWith("ApiKey ")) {
    apiKeyString = authHeader.substring(7);
  }

  if (!apiKeyString) {
    return {
      authenticated: false,
      error: NextResponse.json(
        { error: "Invalid Authorization header format" },
        { status: 401 }
      ),
    };
  }

  // Validate API key
  const result = await validateAPIKey(apiKeyString);

  if (!result.valid) {
    return {
      authenticated: false,
      error: NextResponse.json(
        { error: result.error || "Invalid API key" },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    apiKey: result.apiKey!,
    user: result.user!,
  };
}

/**
 * Checks if API key has required permission
 */
export function requirePermission(
  apiKey: APIKeyEntity,
  permission: string
): NextResponse | null {
  if (!hasPermission(apiKey, permission)) {
    return NextResponse.json(
      {
        error: "Insufficient permissions",
        required: permission,
        granted: apiKey.permissions || ["*"],
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Combined auth check - supports both Clerk and API Key authentication
 * Use this in API routes that should accept both auth methods
 */
export async function authenticateRequest(
  req: NextRequest,
  clerkUserId?: string | null
): Promise<{
  authenticated: boolean;
  user?: UserEntity;
  apiKey?: APIKeyEntity;
  authMethod: "clerk" | "api_key" | null;
  error?: NextResponse;
}> {
  // Check for API key first
  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    const apiKeyResult = await authenticateAPIKey(req);

    if (apiKeyResult.authenticated) {
      return {
        authenticated: true,
        user: apiKeyResult.user,
        apiKey: apiKeyResult.apiKey,
        authMethod: "api_key",
      };
    }
  }

  // Fall back to Clerk authentication
  if (clerkUserId) {
    // Clerk authentication handled by caller
    return {
      authenticated: true,
      authMethod: "clerk",
    };
  }

  // No valid authentication
  return {
    authenticated: false,
    authMethod: null,
    error: NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    ),
  };
}
