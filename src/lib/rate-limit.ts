/**
 * Simple in-memory rate limiter
 *
 * For production with multiple servers, use Upstash Redis:
 * - Sign up at https://upstash.com
 * - Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env
 * - Uncomment the Upstash implementation below
 */

// Simple in-memory rate limiter (works for single server)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;  // Maximum requests allowed
  windowMs: number;     // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request is within rate limits
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID, API key)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  // Get or create record
  let record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    // Create new record
    record = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, record);
  }

  // Increment count
  record.count++;

  // Check if limit exceeded
  const success = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: record.resetAt,
  };
}

/**
 * Get client identifier from request headers
 * Uses IP address or user ID
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown';

  return `ip:${ip}`;
}

/**
 * Preset rate limit configurations
 */
export const RATE_LIMITS = {
  // Very strict - for expensive operations (AI generation)
  AI_GENERATION: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
  },

  // Strict - for API writes
  API_WRITE: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
  },

  // Moderate - for API reads
  API_READ: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },

  // Lenient - for public endpoints
  PUBLIC: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 200 requests per minute
  },
} as const;

/*
 * UPSTASH REDIS IMPLEMENTATION (for production with multiple servers)
 *
 * Uncomment this section and add environment variables:
 * UPSTASH_REDIS_REST_URL=your_url
 * UPSTASH_REDIS_REST_TOKEN=your_token
 */

/*
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiters = {
  aiGeneration: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
  }),

  apiWrite: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
  }),

  apiRead: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
  }),

  public: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "1 m"),
    analytics: true,
  }),
};
*/
