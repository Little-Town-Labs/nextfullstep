import { DataSource } from "typeorm";
import { UserEntity } from "@/entities/UserEntity";
import { CareerRoleEntity } from "@/entities/CareerRoleEntity";
import { CareerAssessmentEntity } from "@/entities/CareerAssessmentEntity";
import { RoadmapEntity } from "@/entities/RoadmapEntity";
import { RoadmapTaskEntity } from "@/entities/RoadmapTaskEntity";
import { AICoachingPromptEntity } from "@/entities/AICoachingPromptEntity";
import { BigFiveResultEntity } from "@/entities/BigFiveResultEntity";

/**
 * Centralized TypeORM DataSource configuration
 * Use this in all API routes instead of creating new DataSource instances
 *
 * Now using NeonDB PostgreSQL instead of SQLite
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for NeonDB
  },
  synchronize: true, // Auto-creates/updates tables (disable in production, use migrations)
  logging: false, // Set to true for debugging SQL queries
  entities: [
    UserEntity,
    CareerRoleEntity,
    CareerAssessmentEntity,
    RoadmapEntity,
    RoadmapTaskEntity,
    AICoachingPromptEntity, // Keep existing entities
    BigFiveResultEntity,
  ],
  migrations: [],
  subscribers: [],
});

// Singleton initialization promise to prevent concurrent initialization
let initializationPromise: Promise<DataSource> | null = null;

/**
 * Initialize the database connection
 * Safe to call multiple times - only initializes once
 * Returns the same promise if initialization is already in progress
 */
export async function initializeDatabase(): Promise<DataSource> {
  // If already initialized, return immediately
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  // If initialization is in progress, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = AppDataSource.initialize()
    .then(() => {
      console.log("✅ Database connection initialized successfully");
      return AppDataSource;
    })
    .catch((error) => {
      console.error("❌ Database initialization failed:", error);
      initializationPromise = null; // Reset so it can be retried
      throw error;
    });

  return initializationPromise;
}

/**
 * Get a repository for an entity
 * Usage: const userRepo = await getRepository(UserEntity);
 */
export async function getRepository<T>(entity: new () => T) {
  await initializeDatabase();
  return AppDataSource.getRepository(entity);
}
