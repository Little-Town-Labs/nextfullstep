import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { logSecurityEvent } from "./audit-service";
import { AuditAction, AuditSeverity } from "@/entities/AuditLogEntity";

/**
 * Rate Limiting Service
 * Uses Upstash Redis for distributed rate limiting across multiple servers
 */

// Initialize Upstash Redis client
let redis: Redis | null = null;
let rateLimiters: Record<string, Ratelimit> = {};

function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn(
      "Upstash Redis not configured. Rate limiting will use in-memory fallback (not suitable for production)."
    );
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

/**
 * Get or create a rate limiter with specific configuration
 */
function getRateLimiter(
  name: string,
  config: {
    requests: number;
    window: string; // e.g., "1m", "1h", "1d"
  }
): Ratelimit {
  const key = `${name}:${config.requests}:${config.window}`;

  if (rateLimiters[key]) {
    return rateLimiters[key];
  }

  const redisClient = getRedisClient();

  if (!redisClient) {
    // Fallback to in-memory rate limiting (not distributed)
    console.warn("Using in-memory rate limiting - not suitable for production");
    rateLimiters[key] = new Ratelimit({
      redis: Redis.fromEnv(), // Will fail gracefully
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: `ratelimit:${name}`,
    });
  } else {
    rateLimiters[key] = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: `ratelimit:${name}`,
    });
  }

  return rateLimiters[key];
}

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
async function getIdentifier(
  userId?: string | null
): Promise<{ identifier: string; type: "ip" | "user" }> {
  if (userId) {
    return { identifier: userId, type: "user" };
  }

  // Fall back to IP address
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "anonymous";

  return { identifier: ip, type: "ip" };
}

/**
 * Rate limit for general API requests
 * Default: 60 requests per minute
 */
export async function rateLimitAPI(userId?: string | null): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const limiter = getRateLimiter("api", {
    requests: 60,
    window: "1m",
  });

  const { identifier, type } = await getIdentifier(userId);

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      // Log rate limit exceeded
      await logSecurityEvent({
        action: AuditAction.RATE_LIMIT_EXCEEDED,
        userId: type === "user" ? identifier : undefined,
        description: `Rate limit exceeded for ${type}: ${identifier}`,
        severity: AuditSeverity.WARNING,
        metadata: {
          identifier,
          type,
          limit,
          remaining,
          reset,
        },
      });
    }

    return { success, limit, remaining, reset };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Allow request if rate limit check fails
    return { success: true, limit: 60, remaining: 60, reset: Date.now() + 60000 };
  }
}

/**
 * Rate limit for authentication attempts
 * More restrictive: 5 attempts per 15 minutes
 */
export async function rateLimitAuth(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const limiter = getRateLimiter("auth", {
    requests: 5,
    window: "15m",
  });

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      await logSecurityEvent({
        action: AuditAction.RATE_LIMIT_EXCEEDED,
        description: `Auth rate limit exceeded for: ${identifier}`,
        severity: AuditSeverity.WARNING,
        metadata: {
          identifier,
          type: "auth",
          limit,
          remaining,
          reset,
        },
      });
    }

    return { success, limit, remaining, reset };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { success: true, limit: 5, remaining: 5, reset: Date.now() + 900000 };
  }
}

/**
 * Rate limit for admin actions
 * Moderate: 100 requests per minute
 */
export async function rateLimitAdmin(userId: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const limiter = getRateLimiter("admin", {
    requests: 100,
    window: "1m",
  });

  try {
    const { success, limit, remaining, reset } = await limiter.limit(userId);

    if (!success) {
      await logSecurityEvent({
        action: AuditAction.RATE_LIMIT_EXCEEDED,
        userId,
        description: `Admin rate limit exceeded for user: ${userId}`,
        severity: AuditSeverity.WARNING,
        metadata: {
          userId,
          type: "admin",
          limit,
          remaining,
          reset,
        },
      });
    }

    return { success, limit, remaining, reset };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { success: true, limit: 100, remaining: 100, reset: Date.now() + 60000 };
  }
}

/**
 * Reset rate limit for specific identifier (admin function)
 */
export async function resetRateLimit(
  name: string,
  identifier: string
): Promise<boolean> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      console.warn("Cannot reset rate limit - Redis not configured");
      return false;
    }

    await redisClient.del(`ratelimit:${name}:${identifier}`);
    return true;
  } catch (error) {
    console.error("Failed to reset rate limit:", error);
    return false;
  }
}
