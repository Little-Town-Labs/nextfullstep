import { getRepository } from "./data-source";
import { APIKeyEntity } from "@/entities/APIKeyEntity";
import { UserEntity } from "@/entities/UserEntity";
import crypto from "crypto";
import { headers } from "next/headers";
import { createAuditLog } from "./audit-service";
import { AuditAction } from "@/entities/AuditLogEntity";

/**
 * API Key Service
 * Handles creation, validation, and management of API keys
 */

interface CreateAPIKeyParams {
  userId: string;
  name: string;
  description?: string;
  permissions?: string[];
  expiresInDays?: number;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
}

interface APIKeyValidationResult {
  valid: boolean;
  apiKey?: APIKeyEntity;
  user?: UserEntity;
  error?: string;
}

/**
 * Generates a secure API key
 * Format: nfs_<random_32_chars>
 */
function generateAPIKey(): { key: string; hash: string; prefix: string } {
  const randomBytes = crypto.randomBytes(24);
  const key = `nfs_${randomBytes.toString("base64url")}`;

  // Hash the key for storage (never store plain key)
  const hash = crypto.createHash("sha256").update(key).digest("hex");

  // Store first 8 characters for identification
  const prefix = key.substring(0, 12);

  return { key, hash, prefix };
}

/**
 * Creates a new API key for a user
 */
export async function createAPIKey(
  params: CreateAPIKeyParams
): Promise<{ apiKey: APIKeyEntity; plainKey: string }> {
  const repo = await getRepository(APIKeyEntity);
  const userRepo = await getRepository(UserEntity);

  // Verify user exists
  const user = await userRepo.findOne({ where: { id: params.userId } });
  if (!user) {
    throw new Error("User not found");
  }

  // Generate API key
  const { key: plainKey, hash, prefix } = generateAPIKey();

  // Calculate expiration date
  let expiresAt: Date | null = null;
  if (params.expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + params.expiresInDays);
  }

  // Get IP address from headers
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    null;

  // Create API key entity
  const apiKey = repo.create({
    name: params.name,
    keyHash: hash,
    keyPrefix: prefix,
    userId: params.userId,
    isActive: true,
    permissions: params.permissions || null,
    rateLimit: params.rateLimit || null,
    expiresAt,
    description: params.description || null,
    createdByIpAddress: ipAddress,
  });

  await repo.save(apiKey);

  // Log API key creation
  await createAuditLog({
    action: AuditAction.API_KEY_CREATE,
    performedById: params.userId,
    description: `Created API key: ${params.name}`,
    metadata: {
      apiKeyId: apiKey.id,
      keyPrefix: prefix,
      name: params.name,
      permissions: params.permissions,
      expiresAt,
    },
    resourceType: "api_key",
    resourceId: apiKey.id,
  });

  return { apiKey, plainKey };
}

/**
 * Validates an API key and returns associated data
 */
export async function validateAPIKey(
  key: string
): Promise<APIKeyValidationResult> {
  try {
    // Hash the provided key
    const hash = crypto.createHash("sha256").update(key).digest("hex");

    const repo = await getRepository(APIKeyEntity);

    // Find API key by hash
    const apiKey = await repo.findOne({
      where: { keyHash: hash },
      relations: ["user"],
    });

    if (!apiKey) {
      return { valid: false, error: "Invalid API key" };
    }

    // Check if key is active
    if (!apiKey.isActive) {
      return { valid: false, error: "API key is inactive" };
    }

    // Check if key is revoked
    if (apiKey.revokedAt) {
      return { valid: false, error: "API key has been revoked" };
    }

    // Check expiration
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return { valid: false, error: "API key has expired" };
    }

    // Update last used timestamp and IP
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;

    apiKey.lastUsedAt = new Date();
    apiKey.lastUsedIpAddress = ipAddress;
    apiKey.usageCount += 1;
    await repo.save(apiKey);

    return {
      valid: true,
      apiKey,
      user: apiKey.user,
    };
  } catch (error) {
    console.error("Error validating API key:", error);
    return { valid: false, error: "API key validation failed" };
  }
}

/**
 * Revokes an API key
 */
export async function revokeAPIKey(
  apiKeyId: string,
  userId: string,
  reason?: string
): Promise<boolean> {
  try {
    const repo = await getRepository(APIKeyEntity);

    const apiKey = await repo.findOne({ where: { id: apiKeyId } });

    if (!apiKey) {
      return false;
    }

    apiKey.isActive = false;
    apiKey.revokedAt = new Date();
    apiKey.revokedReason = reason || null;

    await repo.save(apiKey);

    // Log API key revocation
    await createAuditLog({
      action: AuditAction.API_KEY_REVOKE,
      performedById: userId,
      description: `Revoked API key: ${apiKey.name}`,
      metadata: {
        apiKeyId: apiKey.id,
        keyPrefix: apiKey.keyPrefix,
        name: apiKey.name,
        reason,
      },
      resourceType: "api_key",
      resourceId: apiKey.id,
    });

    return true;
  } catch (error) {
    console.error("Error revoking API key:", error);
    return false;
  }
}

/**
 * Gets all API keys for a user
 */
export async function getUserAPIKeys(userId: string): Promise<APIKeyEntity[]> {
  const repo = await getRepository(APIKeyEntity);

  return repo.find({
    where: { userId },
    order: { createdAt: "DESC" },
  });
}

/**
 * Gets a specific API key by ID
 */
export async function getAPIKeyById(id: string): Promise<APIKeyEntity | null> {
  const repo = await getRepository(APIKeyEntity);

  return repo.findOne({
    where: { id },
    relations: ["user"],
  });
}

/**
 * Checks if API key has specific permission
 */
export function hasPermission(
  apiKey: APIKeyEntity,
  permission: string
): boolean {
  if (!apiKey.permissions || apiKey.permissions.length === 0) {
    // No permissions = full access (for backwards compatibility)
    return true;
  }

  // Check for wildcard permission
  if (apiKey.permissions.includes("*")) {
    return true;
  }

  // Check for specific permission or wildcard scope
  // e.g., "read:users" matches "read:*" or "read:users"
  const [scope, resource] = permission.split(":");

  return apiKey.permissions.some((p) => {
    if (p === permission) return true;
    if (p === `${scope}:*`) return true;
    if (p === "*") return true;
    return false;
  });
}

/**
 * Checks rate limit for API key
 */
export async function checkRateLimit(
  apiKeyId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const apiKey = await getAPIKeyById(apiKeyId);

  if (!apiKey || !apiKey.rateLimit) {
    return { allowed: true, remaining: -1 }; // No rate limit
  }

  // TODO: Implement actual rate limiting with Redis
  // For now, just return allowed
  // This will be implemented with Upstash Redis in next task

  return { allowed: true, remaining: apiKey.rateLimit.requestsPerMinute };
}
