import { z } from "zod";

/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup
 * Provides type-safe access to environment variables
 */

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  CLERK_WEBHOOK_SECRET: z.string().min(1, "CLERK_WEBHOOK_SECRET is required for webhook verification"),

  // AI (OpenRouter)
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required for AI features"),

  // Optional Configuration
  DEFAULT_AI_MODEL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  DATABASE_LOGGING: z.enum(["true", "false"]).optional(),

  // Rate Limiting (optional - for Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at app startup to ensure all required vars are present
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      DEFAULT_AI_MODEL: process.env.DEFAULT_AI_MODEL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      DATABASE_LOGGING: process.env.DATABASE_LOGGING,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("\n❌ Invalid environment variables:\n");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      console.error("\nPlease check your .env file and ensure all required variables are set.\n");
      throw new Error("Environment validation failed");
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Safe to call multiple times - validation happens once at import
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === "development";
}

// Validate environment on module import (fails fast if invalid)
if (process.env.NEXT_RUNTIME !== "edge") {
  // Only validate in Node.js runtime, not Edge runtime
  try {
    validateEnv();
    console.log("✅ Environment variables validated successfully");
  } catch (error) {
    // Error already logged in validateEnv()
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}
