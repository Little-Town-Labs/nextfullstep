import { DataSource } from "typeorm";
import { UserEntity } from "@/entities/UserEntity";
import { CareerRoleEntity } from "@/entities/CareerRoleEntity";
import { CareerAssessmentEntity } from "@/entities/CareerAssessmentEntity";
import { RoadmapEntity } from "@/entities/RoadmapEntity";
import { RoadmapTaskEntity } from "@/entities/RoadmapTaskEntity";
import { UserTodoEntity } from "@/entities/UserTodoEntity";
import { TodoReminderEntity } from "@/entities/TodoReminderEntity";
import { AIModelConfigEntity } from "@/entities/AIModelConfigEntity";
import { AIUsageLogEntity } from "@/entities/AIUsageLogEntity";
import { AuditLogEntity } from "@/entities/AuditLogEntity";
import { APIKeyEntity } from "@/entities/APIKeyEntity";
import { AICoachingPromptEntity } from "@/entities/AICoachingPromptEntity";
import { DevelopmentPlanEntity } from "@/entities/DevelopmentPlanEntity";
import { QuarterlyReviewEntity } from "@/entities/QuarterlyReviewEntity";

/**
 * Centralized TypeORM DataSource configuration
 * Use this in all API routes instead of creating new DataSource instances
 *
 * Now using NeonDB PostgreSQL instead of SQLite
 */
let dataSourceInstance: DataSource | null = null;

function getDataSourceConfig() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: "postgres" as const,
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for NeonDB
    },
    // Use synchronize in development for convenience, migrations in production
    synchronize: !isProduction,
    logging: process.env.DATABASE_LOGGING === 'true',
    entities: [
      UserEntity,
      CareerRoleEntity,
      CareerAssessmentEntity,
      RoadmapEntity,
      RoadmapTaskEntity,
      UserTodoEntity,
      TodoReminderEntity,
      AIModelConfigEntity,
      AIUsageLogEntity,
      AuditLogEntity,
      APIKeyEntity,
      AICoachingPromptEntity,
      DevelopmentPlanEntity,
      QuarterlyReviewEntity,
    ],
    migrations: [],
    subscribers: [],
    // Connection pool settings for serverless
    extra: {
      max: 10, // Maximum number of clients in the pool
      min: 2,  // Minimum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
    },
  };
}

function getAppDataSource(): DataSource {
  if (!dataSourceInstance) {
    dataSourceInstance = new DataSource(getDataSourceConfig());
  }
  return dataSourceInstance;
}

// Export a getter for AppDataSource
export const AppDataSource = new Proxy({} as DataSource, {
  get(_target, prop) {
    const ds = getAppDataSource();
    const value = (ds as any)[prop];
    // Bind methods to the DataSource instance
    if (typeof value === 'function') {
      return value.bind(ds);
    }
    return value;
  }
});

// Singleton initialization promise to prevent concurrent initialization
let initializationPromise: Promise<DataSource> | null = null;

/**
 * Initialize the database connection
 * Safe to call multiple times - only initializes once
 * Returns the same promise if initialization is already in progress
 */
export async function initializeDatabase(): Promise<DataSource> {
  const ds = getAppDataSource();

  // If already initialized, return immediately
  if (ds.isInitialized) {
    return ds;
  }

  // If initialization is in progress, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = ds.initialize()
    .then(() => {
      console.log("✅ Database connection initialized successfully");
      return ds;
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
  return getAppDataSource().getRepository(entity);
}
