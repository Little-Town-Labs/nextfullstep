import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier, RateLimitConfig } from "./rate-limit";

/**
 * Higher-order function to add rate limiting to API routes
 *
 * Usage:
 * export const GET = withRateLimit(
 *   async (req) => { ... },
 *   RATE_LIMITS.API_READ
 * );
 */
export function withRateLimit<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<Response>,
  config: RateLimitConfig,
  getUserId?: (req: NextRequest) => Promise<string | undefined>
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    try {
      // Get user ID if provided
      const userId = getUserId ? await getUserId(req) : undefined;

      // Get client identifier (IP or user ID)
      const identifier = getClientIdentifier(req, userId);

      // Check rate limit
      const result = checkRateLimit(identifier, config);

      // Add rate limit headers
      const headers = new Headers();
      headers.set("X-RateLimit-Limit", result.limit.toString());
      headers.set("X-RateLimit-Remaining", result.remaining.toString());
      headers.set("X-RateLimit-Reset", new Date(result.reset).toISOString());

      // If rate limit exceeded, return 429
      if (!result.success) {
        return NextResponse.json(
          {
            error: "Too many requests",
            message: "You have exceeded the rate limit. Please try again later.",
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers,
          }
        );
      }

      // Call the actual handler
      const response = await handler(req, ...args);

      // Add rate limit headers to successful response
      const responseWithHeaders = new Response(response.body, response);
      headers.forEach((value, key) => {
        responseWithHeaders.headers.set(key, value);
      });

      return responseWithHeaders;
    } catch (error) {
      console.error("Rate limit error:", error);
      // On error, allow the request (fail open)
      return handler(req, ...args);
    }
  };
}
