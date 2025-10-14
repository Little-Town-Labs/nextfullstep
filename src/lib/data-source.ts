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

let isInitialized = false;

/**
 * Initialize the database connection
 * Call this at the start of API routes
 * Safe to call multiple times - only initializes once
 */
export async function initializeDatabase(): Promise<DataSource> {
  if (!isInitialized && !AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    isInitialized = true;
    console.log("Database connection initialized");
  }
  return AppDataSource;
}

/**
 * Get a repository for an entity
 * Usage: const userRepo = await getRepository(UserEntity);
 */
export async function getRepository<T>(entity: new () => T) {
  await initializeDatabase();
  return AppDataSource.getRepository(entity);
}
